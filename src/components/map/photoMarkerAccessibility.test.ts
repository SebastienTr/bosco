import { describe, expect, it, vi } from "vitest";
import { applyPhotoMarkerAccessibility } from "./photoMarkerAccessibility";

describe("applyPhotoMarkerAccessibility", () => {
  it("adds accessible button semantics and keyboard activation", () => {
    const element = document.createElement("div");
    const onActivate = vi.fn();

    const cleanup = applyPhotoMarkerAccessibility({
      element,
      label: "Leg 2",
      onActivate,
    });

    expect(element.getAttribute("role")).toBe("button");
    expect(element.getAttribute("tabindex")).toBe("0");
    expect(element.getAttribute("aria-label")).toBe(
      "Photo at Leg 2 — tap to view",
    );
    expect(element.classList.contains("bosco-photo-marker")).toBe(true);

    element.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    element.dispatchEvent(new KeyboardEvent("keydown", { key: " " }));

    expect(onActivate).toHaveBeenCalledTimes(2);

    cleanup();
    element.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));

    expect(onActivate).toHaveBeenCalledTimes(2);
  });
});
