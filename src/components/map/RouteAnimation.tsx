"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import { toLatLngs } from "./RouteLayer";
import { messages } from "@/app/[username]/[slug]/messages";

type AnimationState = "idle" | "playing" | "paused" | "complete";

interface LegData {
  coordinates: GeoJSON.Position[];
}

interface RouteAnimationProps {
  legs: LegData[];
  totalDistanceNm: number;
  /** Called when animation completes — parent should render static RouteLayer */
  onComplete: () => void;
  /** Callback to update boat marker position [lng, lat] */
  onBoatPositionChange: (position: [number, number] | null) => void;
}

const ANIMATION_WEIGHT = 4;
const STATIC_WEIGHT = 3;
const TRACK_COLOR = "#2563EB";
const TRACK_OPACITY = 0.85;

function calculateDuration(distanceNm: number): number {
  return Math.min(8, Math.max(3, distanceNm / 125));
}

export function RouteAnimation({
  legs,
  totalDistanceNm,
  onComplete,
  onBoatPositionChange,
}: RouteAnimationProps) {
  const map = useMap();
  const [state, setState] = useState<AnimationState>("idle");
  const stateRef = useRef<AnimationState>("idle");
  const polylinesRef = useRef<L.Polyline[]>([]);
  const startTimeRef = useRef(0);
  const pausedElapsedRef = useRef(0);
  const animationFrameRef = useRef(0);

  const prefersReducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const durationMs = useMemo(
    () => calculateDuration(totalDistanceNm) * 1000,
    [totalDistanceNm],
  );

  const allLatLngs = useMemo(
    () => legs.flatMap((leg) => toLatLngs(leg.coordinates)),
    [legs],
  );

  const totalCoordCount = useMemo(
    () => legs.reduce((sum, leg) => sum + leg.coordinates.length, 0),
    [legs],
  );

  // Fit map to all track bounds immediately, then create polylines
  useEffect(() => {
    const allCoords = legs.flatMap((leg) => toLatLngs(leg.coordinates));
    if (allCoords.length > 0) {
      const bounds = L.latLngBounds(allCoords as L.LatLngExpression[]);
      map.fitBounds(bounds, { padding: [20, 20] });
    }

    const polylines = legs.map(() =>
      L.polyline([], {
        color: TRACK_COLOR,
        opacity: TRACK_OPACITY,
        weight: ANIMATION_WEIGHT,
      }).addTo(map),
    );
    polylinesRef.current = polylines;

    return () => {
      polylines.forEach((p) => p.remove());
    };
  }, [map, legs]);

  useEffect(() => {
    if (allLatLngs.length === 0) {
      return;
    }

    const bounds = L.latLngBounds(allLatLngs as L.LatLngExpression[]);
    map.fitBounds(bounds, { padding: [20, 20] });
  }, [allLatLngs, map]);

  // Update polylines to show a given number of visible coordinates
  const updatePolylines = useCallback(
    (visibleCount: number) => {
      let remaining = visibleCount;
      let lastVisibleCoord: GeoJSON.Position | null = null;

      for (let i = 0; i < legs.length; i++) {
        const coords = legs[i].coordinates;
        const show = Math.min(remaining, coords.length);

        if (show > 0) {
          const visibleCoords = coords.slice(0, show);
          const latLngs = toLatLngs(visibleCoords);
          polylinesRef.current[i]?.setLatLngs(latLngs);
          lastVisibleCoord = visibleCoords[visibleCoords.length - 1];
        } else {
          polylinesRef.current[i]?.setLatLngs([]);
        }

        remaining -= show;
        if (remaining <= 0) break;
      }

      if (lastVisibleCoord) {
        onBoatPositionChange([lastVisibleCoord[0], lastVisibleCoord[1]]);
      }
    },
    [legs, onBoatPositionChange],
  );

  // Show final state (all tracks visible)
  const showFinalState = useCallback(() => {
    updatePolylines(totalCoordCount);
    polylinesRef.current.forEach((p) =>
      p.setStyle({ weight: STATIC_WEIGHT }),
    );
  }, [updatePolylines, totalCoordCount]);

  // Animation loop
  const animate = useCallback(
    (timestamp: number) => {
      if (stateRef.current !== "playing") return;

      const elapsed = timestamp - startTimeRef.current + pausedElapsedRef.current;
      const progress = Math.min(elapsed / durationMs, 1);
      const visibleCount = Math.floor(progress * totalCoordCount);

      updatePolylines(visibleCount);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        stateRef.current = "complete";
        setState("complete");
        showFinalState();
        onComplete();
      }
    },
    [durationMs, totalCoordCount, updatePolylines, showFinalState, onComplete],
  );

  // Start animation on mount
  useEffect(() => {
    if (prefersReducedMotion) {
      showFinalState();
      stateRef.current = "complete";
      setState("complete");
      onComplete();
      return;
    }

    // Start playing
    stateRef.current = "playing";
    setState("playing");
    startTimeRef.current = performance.now();
    pausedElapsedRef.current = 0;
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
    };
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tap to pause/resume
  useEffect(() => {
    const handleClick = () => {
      if (stateRef.current === "playing") {
        // Pause
        cancelAnimationFrame(animationFrameRef.current);
        pausedElapsedRef.current +=
          performance.now() - startTimeRef.current;
        stateRef.current = "paused";
        setState("paused");
      } else if (stateRef.current === "paused") {
        // Resume
        stateRef.current = "playing";
        setState("playing");
        startTimeRef.current = performance.now();
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    map.on("click", handleClick);
    return () => {
      map.off("click", handleClick);
    };
  }, [map, animate]);

  return (
    <div aria-live="polite" className="sr-only">
      {state === "playing" && messages.animation.playing}
      {state === "complete" && messages.animation.complete}
    </div>
  );
}
