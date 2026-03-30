import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Home from "./page";
import { landingMessages } from "./landing-messages";

const mockUseSearchParams = vi.fn();

vi.mock("next/navigation", () => ({
  useSearchParams: () => mockUseSearchParams(),
}));

describe("Home", () => {
  beforeEach(() => {
    window.localStorage.clear();
    mockUseSearchParams.mockReturnValue(new URLSearchParams());
  });

  it("renders legal links in the footer", () => {
    render(<Home />);

    expect(
      screen.getByRole("link", {
        name: /privacy policy/i,
      }).getAttribute("href"),
    ).toBe("/legal/privacy");
    expect(
      screen.getByRole("link", {
        name: /terms of service/i,
      }).getAttribute("href"),
    ).toBe("/legal/terms");
  });

  it("renders a confirmation banner when account deletion completed", () => {
    mockUseSearchParams.mockReturnValue(
      new URLSearchParams("accountDeleted=1"),
    );

    render(<Home />);

    expect(
      screen.getByText(landingMessages.en.alerts.accountDeleted),
    ).toBeTruthy();
  });
});
