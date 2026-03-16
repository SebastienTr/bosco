"use server";

import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { getVoyageById } from "@/lib/data/voyages";
import { insertLegs } from "@/lib/data/legs";
import { persistStopovers } from "@/app/voyage/[id]/stopover/actions";
import type { ActionResponse } from "@/types";
import type { Leg } from "@/lib/data/legs";

const LegSchema = z.object({
  track_geojson: z.object({
    type: z.literal("LineString"),
    coordinates: z.array(z.array(z.number()).min(2).max(3)),
  }),
  distance_nm: z.number().nonnegative().nullable(),
  duration_seconds: z.number().int().nonnegative().nullable(),
  avg_speed_kts: z.number().nonnegative().nullable(),
  max_speed_kts: z.number().nonnegative().nullable(),
  started_at: z.string().nullable(),
  ended_at: z.string().nullable(),
});

const StopoverInputSchema = z.object({
  longitude: z.number(),
  latitude: z.number(),
  type: z.enum(["departure", "arrival", "waypoint"]),
  trackIndices: z.array(z.number()),
  arrived_at: z.string().nullable(),
  departed_at: z.string().nullable(),
});

const ImportTracksSchema = z.object({
  voyageId: z.string().uuid(),
  legs: z.array(LegSchema).min(1, "At least one track must be selected"),
  stopovers: z.array(StopoverInputSchema).optional(),
});

export async function importTracks(
  input: z.input<typeof ImportTracksSchema>,
): Promise<ActionResponse<Leg[]>> {
  const authResult = await requireAuth();
  if (authResult.error) return { data: null, error: authResult.error };

  const parsed = ImportTracksSchema.safeParse(input);
  if (!parsed.success) {
    return {
      data: null,
      error: {
        code: "VALIDATION_ERROR",
        message: parsed.error.issues[0].message,
      },
    };
  }

  // Verify voyage ownership
  const { data: voyage, error: voyageError } = await getVoyageById(
    parsed.data.voyageId,
  );
  if (voyageError || !voyage) {
    return {
      data: null,
      error: { code: "NOT_FOUND", message: "Voyage not found" },
    };
  }
  if (voyage.user_id !== authResult.data.id) {
    return {
      data: null,
      error: { code: "FORBIDDEN", message: "Not your voyage" },
    };
  }

  const legsToInsert = parsed.data.legs.map((leg) => ({
    voyage_id: parsed.data.voyageId,
    track_geojson: leg.track_geojson,
    distance_nm: leg.distance_nm,
    duration_seconds: leg.duration_seconds,
    avg_speed_kts: leg.avg_speed_kts,
    max_speed_kts: leg.max_speed_kts,
    started_at: leg.started_at,
    ended_at: leg.ended_at,
  }));

  const { data, error } = await insertLegs(legsToInsert);
  if (error) {
    return {
      data: null,
      error: { code: "EXTERNAL_SERVICE_ERROR", message: error.message },
    };
  }

  // Persist stopovers if provided (non-blocking for geocoding)
  if (parsed.data.stopovers && parsed.data.stopovers.length > 0) {
    void persistStopovers({
      voyageId: parsed.data.voyageId,
      stopovers: parsed.data.stopovers,
    });
  }

  return { data, error: null };
}
