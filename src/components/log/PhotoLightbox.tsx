"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { LightboxPhoto } from "@/components/map/photo-markers-utils";

interface PhotoLightboxProps {
  photos: LightboxPhoto[];
  initialIndex: number;
  onClose: () => void;
}

export function PhotoLightbox({
  photos,
  initialIndex,
  onClose,
}: PhotoLightboxProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [swipeStart, setSwipeStart] = useState<number | null>(null);

  const hasMultiple = photos.length > 1;

  const goNext = useCallback(() => {
    if (!hasMultiple) return;
    setCurrentIndex((i) => (i + 1) % photos.length);
  }, [hasMultiple, photos.length]);

  const goPrev = useCallback(() => {
    if (!hasMultiple) return;
    setCurrentIndex((i) => (i - 1 + photos.length) % photos.length);
  }, [hasMultiple, photos.length]);

  // Reset index when initialIndex changes
  useEffect(() => {
    if (photos.length === 0) return;
    const nextIndex = Math.min(Math.max(initialIndex, 0), photos.length - 1);
    setCurrentIndex(nextIndex);
  }, [initialIndex, photos.length]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
      // Focus trap: Tab within the lightbox
      if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [onClose, goNext, goPrev],
  );

  useEffect(() => {
    if (photos.length === 0) return;
    document.addEventListener("keydown", handleKeyDown);
    closeButtonRef.current?.focus();
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [photos.length, handleKeyDown]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setSwipeStart(e.clientX);
  }, []);

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (swipeStart === null) return;
      const diff = e.clientX - swipeStart;
      if (Math.abs(diff) > 50) {
        diff > 0 ? goPrev() : goNext();
      }
      setSwipeStart(null);
    },
    [swipeStart, goPrev, goNext],
  );

  if (photos.length === 0) return null;

  const photo = photos[currentIndex] ?? photos[0];
  if (!photo) return null;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-label="Photo viewer"
      aria-modal="true"
      className="fixed inset-0 z-[600] flex items-center justify-center"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#1B2D4F]/90 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Close button */}
      <button
        ref={closeButtonRef}
        onClick={onClose}
        aria-label="Close photo"
        className="absolute right-4 top-4 z-10 rounded-full p-2 text-white/80 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-ocean focus-visible:outline-offset-2"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>

      {/* Previous arrow */}
      {hasMultiple && (
        <button
          onClick={goPrev}
          aria-label="Previous photo"
          className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full p-2 text-white/60 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-ocean"
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      )}

      {/* Next arrow */}
      {hasMultiple && (
        <button
          onClick={goNext}
          aria-label="Next photo"
          className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full p-2 text-white/60 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-ocean"
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      )}

      {/* Photo + Caption */}
      <div
        className="relative flex flex-col items-center"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        style={{ touchAction: "pan-y" }}
      >
        <div className="relative h-[80vh] w-[90vw] max-w-4xl">
          <Image
            src={photo.url}
            alt={photo.caption.text || photo.caption.location || "Voyage photo"}
            fill
            className="object-contain"
            sizes="90vw"
            priority
          />
        </div>

        {/* Caption bar */}
        <div className="mt-3 max-w-xl text-center">
          {photo.caption.text && (
            <p className="line-clamp-2 text-sm text-white/80">
              {photo.caption.text}
            </p>
          )}
          <p className="mt-1 text-xs text-white/60">
            {photo.caption.location}
            {photo.caption.location && photo.caption.date && " · "}
            {photo.caption.date}
          </p>
        </div>
      </div>
    </div>
  );
}
