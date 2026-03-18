import { describe, it, expect } from "vitest";
import { countryCodeToFlag } from "./country-flag";

describe("countryCodeToFlag", () => {
  it("returns flag emoji for standard country codes", () => {
    expect(countryCodeToFlag("fr")).toBe("\u{1F1EB}\u{1F1F7}"); // FR
    expect(countryCodeToFlag("SE")).toBe("\u{1F1F8}\u{1F1EA}"); // SE
    expect(countryCodeToFlag("dk")).toBe("\u{1F1E9}\u{1F1F0}"); // DK
    expect(countryCodeToFlag("GB")).toBe("\u{1F1EC}\u{1F1E7}"); // GB
    expect(countryCodeToFlag("IT")).toBe("\u{1F1EE}\u{1F1F9}"); // IT
  });

  it("returns flag for territories and dependencies", () => {
    expect(countryCodeToFlag("gg")).toBe("\u{1F1EC}\u{1F1EC}"); // Guernsey
    expect(countryCodeToFlag("je")).toBe("\u{1F1EF}\u{1F1EA}"); // Jersey
    expect(countryCodeToFlag("gi")).toBe("\u{1F1EC}\u{1F1EE}"); // Gibraltar
    expect(countryCodeToFlag("fo")).toBe("\u{1F1EB}\u{1F1F4}"); // Faroe Islands
    expect(countryCodeToFlag("gl")).toBe("\u{1F1EC}\u{1F1F1}"); // Greenland
  });

  it("is case-insensitive", () => {
    expect(countryCodeToFlag("fr")).toBe(countryCodeToFlag("FR"));
    expect(countryCodeToFlag("Gb")).toBe(countryCodeToFlag("gb"));
  });

  it("returns empty string for null input", () => {
    expect(countryCodeToFlag(null)).toBe("");
  });

  it("returns empty string for invalid codes", () => {
    expect(countryCodeToFlag("")).toBe("");
    expect(countryCodeToFlag("F")).toBe("");
    expect(countryCodeToFlag("FRA")).toBe("");
  });
});
