import { describe, expect, it, vi } from "vitest";
import { applyStopoverMarkerAccessibility } from "./stopoverMarkerAccessibility";

describe("applyStopoverMarkerAccessibility", () => {
  it("adds accessible button semantics and keyboard activation", () => {
    const element = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path",
    );
    const onActivate = vi.fn();

    const cleanup = applyStopoverMarkerAccessibility({
      element,
      label: "Brest, France",
      onActivate,
    });

    expect(element.getAttribute("role")).toBe("button");
    expect(element.getAttribute("tabindex")).toBe("0");
    expect(element.getAttribute("aria-label")).toBe(
      "Stopover: Brest, France",
    );
    expect(element.classList.contains("bosco-stopover-marker")).toBe(true);

    element.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    element.dispatchEvent(new KeyboardEvent("keydown", { key: " " }));

    expect(onActivate).toHaveBeenCalledTimes(2);

    cleanup();
    element.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));

    expect(onActivate).toHaveBeenCalledTimes(2);
  });
});
