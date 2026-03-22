import { describe, expect, it } from "vitest";
import { formatMapHash, parseMapHash } from "./map-view-hash";

describe("parseMapHash", () => {
  it("parses a valid shared map hash", () => {
    expect(parseMapHash("#map=7/43.2965/5.3698")).toEqual({
      zoom: 7,
      center: [43.2965, 5.3698],
    });
  });

  it("returns null for invalid hashes", () => {
    expect(parseMapHash("#map=abc/43.2965/5.3698")).toBeNull();
    expect(parseMapHash("#section=details")).toBeNull();
    expect(parseMapHash("")).toBeNull();
  });
});

describe("formatMapHash", () => {
  it("formats a tuple center with stable precision", () => {
    expect(formatMapHash(8, [43.296482, 5.369779])).toBe(
      "#map=8/43.2965/5.3698",
    );
  });

  it("formats an object center", () => {
    expect(formatMapHash(6, { lat: 59.3293235, lng: 18.0685808 })).toBe(
      "#map=6/59.3293/18.0686",
    );
  });
});
