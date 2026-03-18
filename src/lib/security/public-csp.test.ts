import { describe, expect, it } from "vitest";
import {
  buildPublicVoyageCsp,
  isPublicVoyagePath,
} from "./public-csp";

describe("isPublicVoyagePath", () => {
  it("matches public voyage URLs", () => {
    expect(isPublicVoyagePath("/seb/nice-to-corsica")).toBe(true);
  });

  it("does not match reserved internal routes", () => {
    expect(isPublicVoyagePath("/dashboard/profile")).toBe(false);
    expect(isPublicVoyagePath("/voyage/123")).toBe(false);
  });
});

describe("buildPublicVoyageCsp", () => {
  it("includes a nonce and blocks unsafe inline scripts in production", () => {
    const csp = buildPublicVoyageCsp("abc123", false);
    const scriptDirective = csp
      .split("; ")
      .find((directive) => directive.startsWith("script-src"));

    expect(csp).toContain("script-src 'self' 'nonce-abc123' 'strict-dynamic'");
    expect(scriptDirective).not.toContain("'unsafe-inline'");
    expect(csp).not.toContain("'unsafe-eval'");
  });

  it("keeps unsafe-eval only in development", () => {
    const csp = buildPublicVoyageCsp("abc123", true);

    expect(csp).toContain("'unsafe-eval'");
  });
});
