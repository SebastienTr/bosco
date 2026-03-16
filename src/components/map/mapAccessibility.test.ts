import { describe, expect, it } from "vitest";
import {
  applyMapAccessibility,
  MAP_ARIA_ROLE,
} from "./mapAccessibility";

function createMockElement(): HTMLElement {
  const attributes = new Map<string, string>();

  return {
    setAttribute(name: string, value: string) {
      attributes.set(name, value);
    },
    getAttribute(name: string) {
      return attributes.get(name) ?? null;
    },
  } as unknown as HTMLElement;
}

describe("applyMapAccessibility", () => {
  it("adds the accessible role and name to the Leaflet container", () => {
    const container = createMockElement();

    applyMapAccessibility(container, "Sailing voyage map");

    expect(container.getAttribute("role")).toBe(MAP_ARIA_ROLE);
    expect(container.getAttribute("aria-label")).toBe("Sailing voyage map");
  });

  it("updates the label when accessibility text changes", () => {
    const container = createMockElement();

    applyMapAccessibility(container, "Old label");
    applyMapAccessibility(container, "Updated label");

    expect(container.getAttribute("aria-label")).toBe("Updated label");
  });
});
