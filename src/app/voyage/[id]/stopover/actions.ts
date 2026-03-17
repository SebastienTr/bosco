"use server";

import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { getVoyageById } from "@/lib/data/voyages";
import {
  insertStopovers,
  getStopoversByVoyageId,
  updateStopover as updateStopoverDb,
  deleteStopover as deleteStopoverDb,
} from "@/lib/data/stopovers";
import type { Stopover } from "@/lib/data/stopovers";
import { haversineDistanceNm } from "@/lib/geo/distance";
import {
  reverseGeocodeServer,
  reverseGeocodeBatchServer,
} from "@/lib/geo/reverse-geocode";
import type { ActionResponse } from "@/types";

const DEFAULT_MERGE_RADIUS_NM = 2.7; // ~5 km

// --- Schemas ---

const StopoverCandidateSchema = z.object({
  longitude: z.number(),
  latitude: z.number(),
  type: z.enum(["departure", "arrival", "waypoint"]),
  trackIndices: z.array(z.number()),
  arrived_at: z.string().nullable(),
  departed_at: z.string().nullable(),
});

const PersistStopoversSchema = z.object({
  voyageId: z.string().uuid(),
  stopovers: z.array(StopoverCandidateSchema),
});

const RenameStopoversSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Name is required"),
});

const RepositionStopoverSchema = z.object({
  id: z.string().uuid(),
  latitude: z.number(),
  longitude: z.number(),
});

const DeleteStopoverSchema = z.object({
  id: z.string().uuid(),
});

const MergeStopoversSchema = z.object({
  voyageId: z.string().uuid(),
  stopoverIds: z.tuple([z.string().uuid(), z.string().uuid()]),
});

// --- Helpers ---

async function verifyVoyageOwnership(
  voyageId: string,
  userId: string,
): Promise<ActionResponse<null> | null> {
  const { data: voyage, error } = await getVoyageById(voyageId);
  if (error || !voyage) {
    return { data: null, error: { code: "NOT_FOUND", message: "Voyage not found" } };
  }
  if (voyage.user_id !== userId) {
    return { data: null, error: { code: "FORBIDDEN", message: "Not your voyage" } };
  }
  return null;
}

// --- Actions ---

export async function persistStopovers(
  input: z.input<typeof PersistStopoversSchema>,
): Promise<ActionResponse<Stopover[]>> {
  const authResult = await requireAuth();
  if (authResult.error) return { data: null, error: authResult.error };

  const parsed = PersistStopoversSchema.safeParse(input);
  if (!parsed.success) {
    return {
      data: null,
      error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message },
    };
  }

  const ownershipError = await verifyVoyageOwnership(
    parsed.data.voyageId,
    authResult.data.id,
  );
  if (ownershipError) return ownershipError as ActionResponse<Stopover[]>;

  // Fetch existing stopovers for deduplication
  const { data: existing } = await getStopoversByVoyageId(parsed.data.voyageId);
  const existingStopovers = existing ?? [];

  // Filter candidates that are not within radius of existing stopovers
  const newCandidates = parsed.data.stopovers.filter((candidate) => {
    return !existingStopovers.some((s) => {
      const dist = haversineDistanceNm(
        { lat: candidate.latitude, lon: candidate.longitude },
        { lat: Number(s.latitude), lon: Number(s.longitude) },
      );
      return dist <= DEFAULT_MERGE_RADIUS_NM;
    });
  });

  if (newCandidates.length === 0) {
    return { data: existingStopovers, error: null };
  }

  const toInsert = newCandidates.map((c) => ({
    voyage_id: parsed.data.voyageId,
    name: "",
    country: null as string | null,
    latitude: c.latitude,
    longitude: c.longitude,
    arrived_at: c.arrived_at,
    departed_at: c.departed_at,
  }));

  const { data: inserted, error: insertError } = await insertStopovers(toInsert);
  if (insertError || !inserted) {
    return {
      data: null,
      error: { code: "EXTERNAL_SERVICE_ERROR", message: insertError?.message ?? "Insert failed" },
    };
  }

  // Reverse geocode new stopovers in parallel batch
  const points = inserted.map((s) => ({
    lat: Number(s.latitude),
    lon: Number(s.longitude),
  }));
  const geoResults = await reverseGeocodeBatchServer(points);

  const geocoded = await Promise.all(
    inserted.map(async (stopover, i) => {
      const geo = geoResults[i];
      if (geo.name) {
        const { data: updated } = await updateStopoverDb(stopover.id, {
          name: geo.name,
          country: geo.country,
        });
        return updated ?? stopover;
      }
      return stopover;
    }),
  );

  // Post-geocode name-based deduplication (with distance guard)
  const NAME_MERGE_MAX_NM = 25; // ~46km — prevent merging same-name cities far apart
  const allStopovers = [...existingStopovers, ...geocoded];
  const byName = new Map<string, Stopover[]>();
  for (const s of allStopovers) {
    const normalizedName = s.name?.toLowerCase().trim();
    if (!normalizedName) continue;
    const group = byName.get(normalizedName) ?? [];
    group.push(s);
    byName.set(normalizedName, group);
  }

  const deletedIds = new Set<string>();
  for (const [, group] of byName) {
    if (group.length < 2) continue;
    // Sort by arrived_at ascending — keep the earliest
    const sorted = group.sort((a, b) => {
      if (!a.arrived_at && !b.arrived_at) return 0;
      if (!a.arrived_at) return 1;
      if (!b.arrived_at) return -1;
      return a.arrived_at.localeCompare(b.arrived_at);
    });
    const [keep, ...duplicates] = sorted;
    // Collect all positions for centroid calculation
    const positions = [{ lat: Number(keep.latitude), lon: Number(keep.longitude) }];
    const mergedDups: Stopover[] = [];
    for (const dup of duplicates) {
      // Only merge if within distance guard
      const dist = haversineDistanceNm(
        { lat: Number(keep.latitude), lon: Number(keep.longitude) },
        { lat: Number(dup.latitude), lon: Number(dup.longitude) },
      );
      if (dist > NAME_MERGE_MAX_NM) continue;
      positions.push({ lat: Number(dup.latitude), lon: Number(dup.longitude) });
      mergedDups.push(dup);
    }
    if (mergedDups.length === 0) continue;

    // True centroid of all merged positions
    const centroidLat = positions.reduce((sum, p) => sum + p.lat, 0) / positions.length;
    const centroidLon = positions.reduce((sum, p) => sum + p.lon, 0) / positions.length;

    // Earliest arrival, latest departure across all
    const allArrivals = [keep, ...mergedDups]
      .map((s) => s.arrived_at)
      .filter(Boolean)
      .sort() as string[];
    const allDepartures = [keep, ...mergedDups]
      .map((s) => s.departed_at)
      .filter(Boolean)
      .sort()
      .reverse() as string[];

    const { data: updated } = await updateStopoverDb(keep.id, {
      latitude: centroidLat,
      longitude: centroidLon,
      arrived_at: allArrivals[0] ?? null,
      departed_at: allDepartures[0] ?? null,
      name: keep.name || mergedDups[0].name,
      country: keep.country || mergedDups[0].country,
    });
    if (updated) {
      Object.assign(keep, updated);
    }
    for (const dup of mergedDups) {
      const { error: delError } = await deleteStopoverDb(dup.id);
      if (!delError) {
        deletedIds.add(dup.id);
      }
    }
  }

  const finalStopovers = allStopovers.filter((s) => !deletedIds.has(s.id));
  return { data: finalStopovers, error: null };
}

export async function renameStopover(
  input: z.input<typeof RenameStopoversSchema>,
): Promise<ActionResponse<Stopover>> {
  const authResult = await requireAuth();
  if (authResult.error) return { data: null, error: authResult.error };

  const parsed = RenameStopoversSchema.safeParse(input);
  if (!parsed.success) {
    return {
      data: null,
      error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message },
    };
  }

  const { data, error } = await updateStopoverDb(parsed.data.id, {
    name: parsed.data.name,
  });

  if (error || !data) {
    return {
      data: null,
      error: { code: "NOT_FOUND", message: "Stopover not found" },
    };
  }

  return { data, error: null };
}

export async function repositionStopover(
  input: z.input<typeof RepositionStopoverSchema>,
): Promise<ActionResponse<Stopover>> {
  const authResult = await requireAuth();
  if (authResult.error) return { data: null, error: authResult.error };

  const parsed = RepositionStopoverSchema.safeParse(input);
  if (!parsed.success) {
    return {
      data: null,
      error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message },
    };
  }

  const { data, error } = await updateStopoverDb(parsed.data.id, {
    latitude: parsed.data.latitude,
    longitude: parsed.data.longitude,
  });

  if (error || !data) {
    return {
      data: null,
      error: { code: "NOT_FOUND", message: "Stopover not found" },
    };
  }

  // Fire reverse geocode for new position (non-blocking)
  void reverseGeocodeServer(parsed.data.latitude, parsed.data.longitude).then(
    async (geo) => {
      if (geo.name) {
        await updateStopoverDb(parsed.data.id, { name: geo.name, country: geo.country });
      }
    },
  );

  return { data, error: null };
}

export async function removeStopover(
  input: z.input<typeof DeleteStopoverSchema>,
): Promise<ActionResponse<null>> {
  const authResult = await requireAuth();
  if (authResult.error) return { data: null, error: authResult.error };

  const parsed = DeleteStopoverSchema.safeParse(input);
  if (!parsed.success) {
    return {
      data: null,
      error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message },
    };
  }

  const { error } = await deleteStopoverDb(parsed.data.id);
  if (error) {
    return {
      data: null,
      error: { code: "EXTERNAL_SERVICE_ERROR", message: error.message },
    };
  }

  return { data: null, error: null };
}

export async function mergeStopovers(
  input: z.input<typeof MergeStopoversSchema>,
): Promise<ActionResponse<Stopover>> {
  const authResult = await requireAuth();
  if (authResult.error) return { data: null, error: authResult.error };

  const parsed = MergeStopoversSchema.safeParse(input);
  if (!parsed.success) {
    return {
      data: null,
      error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message },
    };
  }

  const ownershipError = await verifyVoyageOwnership(
    parsed.data.voyageId,
    authResult.data.id,
  );
  if (ownershipError) return ownershipError as ActionResponse<Stopover>;

  const { data: allStopovers } = await getStopoversByVoyageId(parsed.data.voyageId);
  const [id1, id2] = parsed.data.stopoverIds;
  const s1 = allStopovers?.find((s) => s.id === id1);
  const s2 = allStopovers?.find((s) => s.id === id2);

  if (!s1 || !s2) {
    return {
      data: null,
      error: { code: "NOT_FOUND", message: "One or both stopovers not found" },
    };
  }

  const mergedLat = (Number(s1.latitude) + Number(s2.latitude)) / 2;
  const mergedLon = (Number(s1.longitude) + Number(s2.longitude)) / 2;

  const arrivals = [s1.arrived_at, s2.arrived_at]
    .filter(Boolean)
    .sort() as string[];
  const departures = [s1.departed_at, s2.departed_at]
    .filter(Boolean)
    .sort()
    .reverse() as string[];

  const name = s1.name || s2.name;

  const { data: updated, error: updateError } = await updateStopoverDb(s1.id, {
    latitude: mergedLat,
    longitude: mergedLon,
    arrived_at: arrivals[0] ?? null,
    departed_at: departures[0] ?? null,
    name,
  });

  if (updateError || !updated) {
    return {
      data: null,
      error: { code: "EXTERNAL_SERVICE_ERROR", message: updateError?.message ?? "Update failed" },
    };
  }

  await deleteStopoverDb(s2.id);

  return { data: updated, error: null };
}
