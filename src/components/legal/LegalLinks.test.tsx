import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LegalLinks } from "./LegalLinks";

describe("LegalLinks", () => {
  it("renders both legal routes as visible touch-friendly links", () => {
    render(<LegalLinks />);

    const privacyLink = screen.getByRole("link", {
      name: /privacy policy/i,
    });
    const termsLink = screen.getByRole("link", {
      name: /terms of service/i,
    });

    expect(privacyLink.getAttribute("href")).toBe("/legal/privacy");
    expect(termsLink.getAttribute("href")).toBe("/legal/terms");
    expect(privacyLink.className).toContain("min-h-[44px]");
    expect(termsLink.className).toContain("min-h-[44px]");
  });

  it("keeps the current document highlighted while linking to the other one", () => {
    render(<LegalLinks currentPath="/legal/privacy" />);

    expect(
      screen.queryByRole("link", {
        name: /privacy policy/i,
      }),
    ).toBeNull();
    expect(screen.getByText("Privacy Policy")).toBeTruthy();
    expect(
      screen.getByRole("link", {
        name: /terms of service/i,
      }).getAttribute("href"),
    ).toBe("/legal/terms");
  });
});
