"use client";

import { useCallback, useEffect, useRef } from "react";
import Image from "next/image";

interface PhotoLightboxProps {
  url: string | null;
  onClose: () => void;
}

export function PhotoLightbox({ url, onClose }: PhotoLightboxProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      // Focus trap: Tab within the lightbox
      if (e.key === "Tab" && dialogRef.current) {
        const focusable =
          dialogRef.current.querySelectorAll<HTMLElement>(
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
    [onClose],
  );

  useEffect(() => {
    if (!url) return;
    document.addEventListener("keydown", handleKeyDown);
    closeButtonRef.current?.focus();
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [url, handleKeyDown]);

  const isOpen = url !== null;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-label="Photo viewer"
      aria-modal="true"
      className={`fixed inset-0 z-[600] flex items-center justify-center transition-opacity duration-200 ${
        isOpen ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#1B2D4F]/90"
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

      {/* Photo */}
      {url && (
        <div className="relative h-[80vh] w-[90vw] max-w-4xl transition-transform duration-200">
          <Image
            src={url}
            alt=""
            fill
            className="object-contain"
            sizes="90vw"
            priority
          />
        </div>
      )}
    </div>
  );
}
