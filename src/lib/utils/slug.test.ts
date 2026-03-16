import { describe, it, expect } from "vitest";
import { generateSlug } from "./slug";

describe("generateSlug", () => {
  it("should convert simple text to slug", () => {
    expect(generateSlug("My Voyage")).toBe("my-voyage");
  });

  it("should handle diacritics (Scandinavian names)", () => {
    expect(generateSlug("Göteborg")).toBe("goteborg");
  });

  it("should handle special characters and arrows", () => {
    expect(generateSlug("Göteborg → Nice")).toBe("goteborg-nice");
  });

  it("should handle multiple spaces and hyphens", () => {
    expect(generateSlug("  Summer   Voyage  2026  ")).toBe(
      "summer-voyage-2026",
    );
  });

  it("should handle empty string", () => {
    expect(generateSlug("")).toBe("");
  });

  it("should produce lowercase output", () => {
    expect(generateSlug("ATLANTIC CROSSING")).toBe("atlantic-crossing");
  });
});
