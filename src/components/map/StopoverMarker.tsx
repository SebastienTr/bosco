"use client";

import { CircleMarker, Popup } from "react-leaflet";
import type {
  CircleMarker as LeafletCircleMarker,
  LatLngExpression,
} from "leaflet";
import { useEffect, useRef, useState } from "react";
import { applyStopoverMarkerAccessibility } from "./stopoverMarkerAccessibility";

interface StopoverMarkerProps {
  position: [number, number]; // [longitude, latitude] GeoJSON order
  name: string;
  country: string | null;
  readOnly?: boolean;
  onSelect?: () => void;
  onRename?: (name: string) => void;
  onDelete?: () => void;
  onDragEnd?: (lat: number, lon: number) => void;
}

const MARKER_STYLE = {
  color: "#FFFFFF",
  weight: 2,
  fillColor: "#E8614D",
  fillOpacity: 0.9,
  radius: 7,
};

export function StopoverMarker({
  position,
  name,
  country,
  readOnly,
  onSelect,
  onRename,
  onDelete,
}: StopoverMarkerProps) {
  const [editName, setEditName] = useState(name);
  const inputRef = useRef<HTMLInputElement>(null);
  const markerRef = useRef<LeafletCircleMarker | null>(null);

  // Convert GeoJSON [lng, lat] → Leaflet [lat, lng]
  const leafletPosition: LatLngExpression = [position[1], position[0]];

  const displayLabel = [name, country].filter(Boolean).join(", ") || "Unnamed stopover";

  const handleSave = () => {
    if (editName.trim() && editName !== name && onRename) {
      onRename(editName.trim());
    }
  };

  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) return;

    let cleanup: (() => void) | undefined;

    const syncAccessibility = () => {
      const element = marker.getElement();
      if (!element) return;

      cleanup?.();
      cleanup = applyStopoverMarkerAccessibility({
        element: element as SVGElement,
        label: displayLabel,
        onActivate: () => {
          if (onSelect) {
            onSelect();
            return;
          }

          marker.openPopup();
        },
      });
    };

    syncAccessibility();
    marker.on("add", syncAccessibility);

    return () => {
      marker.off("add", syncAccessibility);
      cleanup?.();
    };
  }, [displayLabel, onSelect]);

  return (
    <CircleMarker
      ref={markerRef}
      center={leafletPosition}
      pathOptions={MARKER_STYLE}
      eventHandlers={{
        click: onSelect ? () => onSelect() : undefined,
        mouseover: (e) => {
          e.target.setRadius(8);
        },
        mouseout: (e) => {
          e.target.setRadius(7);
        },
        popupopen: () => {
          setEditName(name);
        },
      }}
      bubblingMouseEvents={false}
    >
      {!(readOnly && onSelect) && (
        <Popup>
          <div
            className="flex min-w-[160px] flex-col gap-2"
            role={readOnly ? undefined : "button"}
            aria-label={`Stopover: ${displayLabel}`}
          >
            {readOnly ? (
              <>
                <span className="text-sm font-medium">{name}</span>
                {country && (
                  <span className="text-xs text-mist">{country}</span>
                )}
              </>
            ) : (
              <>
                <div className="flex gap-1">
                  <input
                    ref={inputRef}
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSave();
                    }}
                    placeholder="Stopover name"
                    className="flex-1 rounded border px-1 py-0.5 text-sm"
                    autoFocus
                  />
                  <button
                    onClick={handleSave}
                    className="rounded bg-ocean px-2 py-0.5 text-xs text-white"
                  >
                    OK
                  </button>
                </div>
                {country && (
                  <span className="text-xs text-mist">{country}</span>
                )}
                {onDelete && (
                  <button
                    onClick={onDelete}
                    className="mt-1 text-left text-xs text-coral hover:text-coral/80"
                  >
                    Delete stopover
                  </button>
                )}
              </>
            )}
          </div>
        </Popup>
      )}
    </CircleMarker>
  );
}
