import { describe, it, expect } from "vitest";
import { countryToFlag } from "./country-flag";

describe("countryToFlag", () => {
  it("returns flag emoji for known countries", () => {
    expect(countryToFlag("France")).toBe("🇫🇷");
    expect(countryToFlag("Sweden")).toBe("🇸🇪");
    expect(countryToFlag("Denmark")).toBe("🇩🇰");
    expect(countryToFlag("Germany")).toBe("🇩🇪");
    expect(countryToFlag("Italy")).toBe("🇮🇹");
    expect(countryToFlag("Spain")).toBe("🇪🇸");
    expect(countryToFlag("United Kingdom")).toBe("🇬🇧");
    expect(countryToFlag("Greece")).toBe("🇬🇷");
    expect(countryToFlag("Croatia")).toBe("🇭🇷");
    expect(countryToFlag("Norway")).toBe("🇳🇴");
  });

  it("returns empty string for null input", () => {
    expect(countryToFlag(null)).toBe("");
  });

  it("returns empty string for unknown country", () => {
    expect(countryToFlag("Atlantis")).toBe("");
    expect(countryToFlag("")).toBe("");
  });

  it("is case-sensitive (matches Nominatim output)", () => {
    expect(countryToFlag("france")).toBe("");
    expect(countryToFlag("FRANCE")).toBe("");
  });
});
