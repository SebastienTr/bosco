import { render, screen, fireEvent } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Home from "./page";
import { landingMessages } from "./landing-messages";

const mockUseSearchParams = vi.fn();

vi.mock("next/navigation", () => ({
  useSearchParams: () => mockUseSearchParams(),
}));

// Mock Leaflet-dependent component
vi.mock("@/components/landing/HeroMapDemo", () => ({
  HeroMapDemo: () => <div data-testid="hero-map-demo" />,
}));

vi.mock("@/components/landing/VoyageShowcaseMiniMap", () => ({
  default: ({ ariaLabel }: { ariaLabel: string }) => (
    <div aria-label={ariaLabel} data-testid="voyage-showcase-map" role="application" />
  ),
}));

describe("Home", () => {
  beforeEach(() => {
    window.localStorage.clear();
    mockUseSearchParams.mockReturnValue(new URLSearchParams());
  });

  it("renders hero title and CTA linking to /auth", () => {
    render(<Home />);

    expect(
      screen.getByText("Your sailing story, traced on the map"),
    ).toBeTruthy();

    const cta = screen.getByRole("link", { name: "Get Started" });
    expect(cta.getAttribute("href")).toBe("/auth");
  });

  it("renders hero map demo", () => {
    render(<Home />);
    expect(screen.getByTestId("hero-map-demo")).toBeTruthy();
  });

  it("renders how-it-works section with 3 steps", () => {
    render(<Home />);

    expect(screen.getByText("Import in under 2 minutes")).toBeTruthy();
    expect(screen.getByText("Export")).toBeTruthy();
    expect(screen.getByText("Import")).toBeTruthy();
    expect(screen.getAllByText("Share").length).toBeGreaterThanOrEqual(1);
  });

  it("renders voyage showcase with stats and link to real voyage", () => {
    render(<Home />);

    expect(screen.getByText("A Real Voyage")).toBeTruthy();
    expect(
      screen.getByText("1,689 nm · 45 ports · 7 countries"),
    ).toBeTruthy();

    const exploreLink = screen.getByRole("link", {
      name: /explore this voyage/i,
    });
    expect(exploreLink.getAttribute("href")).toBe("/Seb/goteborg-to-nice");
    expect(
      screen.getByRole("application", {
        name: /göteborg to nice — a mediterranean sailing adventure\./i,
      }),
    ).toBeTruthy();
  });

  it("renders feature cards", () => {
    render(<Home />);

    expect(screen.getByText("Every Tack, Every Mile")).toBeTruthy();
    expect(screen.getByText("Automatic Stopovers")).toBeTruthy();
    expect(screen.getByText("Share Your Voyage")).toBeTruthy();
  });

  it("renders legal links in the footer", () => {
    render(<Home />);

    expect(
      screen
        .getByRole("link", { name: /privacy policy/i })
        .getAttribute("href"),
    ).toBe("/legal/privacy");
    expect(
      screen
        .getByRole("link", { name: /terms of service/i })
        .getAttribute("href"),
    ).toBe("/legal/terms");
  });

  it("switches language and updates all visible text", () => {
    render(<Home />);

    // Default is English
    expect(
      screen.getByText("Your sailing story, traced on the map"),
    ).toBeTruthy();
    expect(screen.getByText("A Real Voyage")).toBeTruthy();

    // Open the language dropdown
    const trigger = screen.getByRole("button", { name: /english/i });
    fireEvent.click(trigger);

    // Click the French option
    const frButton = screen.getByRole("button", { name: /français/i });
    fireEvent.click(frButton);

    // Verify French text appears
    expect(
      screen.getByText(
        "Votre histoire de navigation, tracée sur la carte",
      ),
    ).toBeTruthy();
    expect(screen.getByText("Un Vrai Voyage")).toBeTruthy();
    expect(
      screen.getByRole("application", {
        name: /göteborg à nice — une aventure méditerranéenne à la voile\./i,
      }),
    ).toBeTruthy();
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

  it("does not show account deletion alert without query param", () => {
    render(<Home />);

    expect(
      screen.queryByText(landingMessages.en.alerts.accountDeleted),
    ).toBeNull();
  });
});
