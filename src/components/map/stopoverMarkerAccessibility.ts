"use client";

interface StopoverMarkerAccessibilityOptions {
  element: SVGElement;
  label: string;
  onActivate?: () => void;
}

export function applyStopoverMarkerAccessibility({
  element,
  label,
  onActivate,
}: StopoverMarkerAccessibilityOptions) {
  element.setAttribute("role", "button");
  element.setAttribute("tabindex", "0");
  element.setAttribute("aria-label", `Stopover: ${label}`);
  element.classList.add("bosco-stopover-marker");

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
