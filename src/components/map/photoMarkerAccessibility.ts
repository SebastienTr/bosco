"use client";

interface PhotoMarkerAccessibilityOptions {
  element: HTMLElement;
  label: string;
  onActivate?: () => void;
}

export function applyPhotoMarkerAccessibility({
  element,
  label,
  onActivate,
}: PhotoMarkerAccessibilityOptions) {
  element.setAttribute("role", "button");
  element.setAttribute("tabindex", "0");
  element.setAttribute("aria-label", `Photo at ${label} — tap to view`);
  element.classList.add("bosco-photo-marker");

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    onActivate?.();
  };

  element.addEventListener("keydown", handleKeyDown);

  return () => {
    element.removeEventListener("keydown", handleKeyDown);
  };
}
