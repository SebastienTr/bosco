import { describe, expect, it } from "vitest";
import { legalDocuments } from "./content";

function collectText(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(collectText).join(" ");
  }

  if (value && typeof value === "object") {
    return Object.values(value as Record<string, unknown>)
      .map(collectText)
      .join(" ");
  }

  return "";
}

function expectPublishedLegalCopy(text: string, effectiveDate: string) {
  expect(effectiveDate).toMatch(/^[A-Z][a-z]+ \d{1,2}, \d{4}$/);
  expect(text).not.toMatch(/\b(todo|tbd|placeholder|draft)\b/i);
  expect(text).not.toContain("insert approved");
  expect(text).not.toContain("before publication");
}

describe("legal content", () => {
  it("covers Bosco-specific privacy disclosures", () => {
    const privacy = legalDocuments.privacy;
    const text = collectText(privacy).toLowerCase();

    expectPublishedLegalCopy(collectText(privacy), privacy.effectiveDate);
    expect(text).toContain("auth email");
    expect(text).toContain("profile");
    expect(text).toContain("gpx");
    expect(text).toContain("coordinates");
    expect(text).toContain("stopover");
    expect(text).toContain("journal");
    expect(text).toContain("photo");
    expect(text).toContain("session");
    expect(text).toContain("analytics");
    expect(text).toContain("supabase");
    expect(text).toContain("vercel");
    expect(text).toContain("sentry");
    expect(text).toContain("nominatim");
    expect(text).toContain("rights");
    expect(text).toContain("retention");
    expect(text).toContain("public");
    expect(text).toContain("consent");
  });

  it("covers the required terms of service topics", () => {
    const terms = legalDocuments.terms;
    const text = collectText(terms).toLowerCase();

    expectPublishedLegalCopy(collectText(terms), terms.effectiveDate);
    expect(text).toContain("service");
    expect(text).toContain("account");
    expect(text).toContain("content");
    expect(text).toContain("license");
    expect(text).toContain("public");
    expect(text).toContain("acceptable use");
    expect(text).toContain("third-party");
    expect(text).toContain("availability");
    expect(text).toContain("delete");
    expect(text).toContain("contact");
    expect(text).toContain("updates");
  });
});
