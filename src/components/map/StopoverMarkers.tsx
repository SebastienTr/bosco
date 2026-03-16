"use client";

import { useCallback, useEffect, useState } from "react";
import { useMap } from "react-leaflet";
import { toast } from "sonner";
import { StopoverMarker } from "./StopoverMarker";
import {
  renameStopover,
  removeStopover,
  repositionStopover,
} from "@/app/voyage/[id]/stopover/actions";
import type { Stopover } from "@/lib/data/stopovers";

interface StopoverMarkersProps {
  stopovers: Stopover[];
  voyageId: string;
}

export function StopoverMarkers({
  stopovers: initialStopovers,
}: StopoverMarkersProps) {
  const [stopovers, setStopovers] = useState(initialStopovers);
  const map = useMap();

  // Listen for center-on-stopover events from StopoverPanel
  useEffect(() => {
    const handler = (e: Event) => {
      const { lat, lng } = (e as CustomEvent).detail;
      map.flyTo([lat, lng], 14, { duration: 0.8 });
    };
    window.addEventListener("bosco:center-stopover", handler);
    return () => window.removeEventListener("bosco:center-stopover", handler);
  }, [map]);

  const handleRename = useCallback(async (id: string, name: string) => {
    const { data, error } = await renameStopover({ id, name });
    if (error) {
      toast.error("Failed to rename stopover");
      return;
    }
    setStopovers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, name: data.name } : s)),
    );
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    const { error } = await removeStopover({ id });
    if (error) {
      toast.error("Failed to delete stopover");
      return;
    }
    setStopovers((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const handleDragEnd = useCallback(
    async (id: string, lat: number, lon: number) => {
      const { error } = await repositionStopover({
        id,
        latitude: lat,
        longitude: lon,
      });
      if (error) {
        toast.error("Failed to reposition stopover");
        return;
      }
      setStopovers((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, latitude: lat, longitude: lon } : s,
        ),
      );
    },
    [],
  );

  return (
    <>
      {stopovers.map((stopover) => (
        <StopoverMarker
          key={stopover.id}
          position={[Number(stopover.longitude), Number(stopover.latitude)]}
          name={stopover.name}
          country={stopover.country}
          onRename={(name) => handleRename(stopover.id, name)}
          onDelete={() => handleDelete(stopover.id)}
          onDragEnd={(lat, lon) => handleDragEnd(stopover.id, lat, lon)}
        />
      ))}
    </>
  );
}
