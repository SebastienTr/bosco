import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

describe("legal pages", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it("exports canonical metadata for both public legal routes", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://www.sailbosco.com");

    const { metadata: privacyMetadata } = await import("./privacy/page");
    const { metadata: termsMetadata } = await import("./terms/page");

    expect(String(privacyMetadata.alternates?.canonical)).toBe(
      "https://www.sailbosco.com/legal/privacy",
    );
    expect(String(termsMetadata.alternates?.canonical)).toBe(
      "https://www.sailbosco.com/legal/terms",
    );
  });

  it("renders the privacy policy with a direct link to the terms", async () => {
    const { default: PrivacyPage } = await import("./privacy/page");

    const { container } = render(<PrivacyPage />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /privacy policy/i,
      }),
    ).toBeTruthy();
    expect(
      screen.getByRole("link", {
        name: /terms of service/i,
      }).getAttribute("href"),
    ).toBe("/legal/terms");
    expect(container.textContent).not.toMatch(/\b(todo|tbd|placeholder|draft)\b/i);
  });

  it("renders the terms with a direct link back to the privacy policy", async () => {
    const { default: TermsPage } = await import("./terms/page");

    const { container } = render(<TermsPage />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /terms of service/i,
      }),
    ).toBeTruthy();
    expect(
      screen.getByRole("link", {
        name: /privacy policy/i,
      }).getAttribute("href"),
    ).toBe("/legal/privacy");
    expect(container.textContent).not.toMatch(/\b(todo|tbd|placeholder|draft)\b/i);
  });
});
