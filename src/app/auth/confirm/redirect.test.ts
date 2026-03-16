import { describe, expect, it } from "vitest";
import { resolvePostAuthRedirect } from "./redirect";

describe("resolvePostAuthRedirect", () => {
  it("keeps safe internal paths", () => {
    expect(resolvePostAuthRedirect("/voyage/new?from=auth#top")).toBe(
      "/voyage/new?from=auth#top",
    );
  });

  it("falls back for external absolute URLs", () => {
    expect(resolvePostAuthRedirect("https://evil.example/steal")).toBe(
      "/dashboard",
    );
  });

  it("falls back for protocol-relative URLs", () => {
    expect(resolvePostAuthRedirect("//evil.example/steal")).toBe("/dashboard");
  });

  it("falls back for non-path values", () => {
    expect(resolvePostAuthRedirect("dashboard")).toBe("/dashboard");
  });
});
