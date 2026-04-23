import type { ReactNode } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Json } from "@/types/supabase";
import PublicVoyageContent from "./PublicVoyageContent";
import { messages } from "./messages";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
  }: {
    src: string;
    alt: string;
  }) => <img src={src} alt={alt} />,
}));

vi.mock("next/dynamic", () => ({
  default: () => () => null,
}));

vi.mock("@/components/map/MapLoader", () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/voyage/StatsBar", () => ({
  StatsBar: () => <div>StatsBar</div>,
}));

vi.mock("@/components/voyage/BoatBadge", () => ({
  BoatBadge: () => <div>BoatBadge</div>,
}));

vi.mock("@/components/voyage/StopoverSheet", () => ({
  StopoverSheet: () => <div>StopoverSheet</div>,
}));

vi.mock("@/components/voyage/PortsPanel", () => ({
  PortsPanel: ({
    messages,
  }: {
    messages: {
      ariaLabel: string;
    };
  }) => <nav aria-label={messages.ariaLabel}>PortsPanel</nav>,
}));

vi.mock("@/components/voyage/ActionFAB", () => ({
  ActionFAB: () => <button type="button">Ports</button>,
}));

describe("PublicVoyageContent", () => {
  const props = {
    voyageName: "Atlantic Loop",
    legs: [] as {
      id: string;
      track_geojson: Json;
      distance_nm: number | null;
      duration_seconds: number | null;
      started_at: string | null;
      ended_at: string | null;
      avg_speed_kts: number | null;
      max_speed_kts: number | null;
    }[],
    stopovers: [] as {
      id: string;
      name: string;
      country: string | null;
      country_code: string | null;
      latitude: number;
      longitude: number;
      arrived_at: string | null;
      departed_at: string | null;
    }[],
    totalDistanceNm: 0,
    days: 0,
    portsCount: 0,
    countriesCount: 0,
    boatName: "Selkie",
    boatType: "sailboat",
    voyageBoatName: null,
    voyageBoatType: null,
    voyageBoatLengthM: null,
    voyageBoatFlag: null,
    voyageHomePort: null,
    username: "seb",
    publicUrl: "https://sailbosco.com/seb/atlantic-loop",
    logEntries: [
      {
        id: "entry-1",
        entry_date: "2026-03-01",
        text: "Anchored in calm water.",
        leg_id: null,
        stopover_id: null,
        photo_urls: [],
      } as never,
    ],
    isOwner: false,
  };

  it("renders the journal panel only when the toggle is clicked", () => {
    render(<PublicVoyageContent {...props} />);

    // Panel is NOT in the DOM when closed (conditional rendering)
    expect(screen.queryByText(messages.journal.header)).toBeNull();

    // Open via toggle button
    fireEvent.click(
      screen.getByRole("button", { name: messages.journal.openLabel }),
    );

    // Panel is now rendered with the header
    expect(screen.getByText(messages.journal.header)).toBeTruthy();

    // Close via the X button inside the panel header
    const closeButtons = screen.getAllByRole("button", {
      name: messages.journal.closeLabel,
    });
    // Click the panel's close button (last one — inside the panel header)
    fireEvent.click(closeButtons[closeButtons.length - 1]);

    // Panel removed from DOM again
    expect(screen.queryByText(messages.journal.header)).toBeNull();
  });

  it("renders the desktop ports sidebar separately from the map area", () => {
    const { container } = render(<PublicVoyageContent {...props} />);

    const desktopSidebar = container.firstElementChild?.firstElementChild;
    expect(desktopSidebar?.className).toContain("lg:block");
  });

  it("opens the tapped journal photo even when it has no map position and shares a URL", () => {
    render(
      <PublicVoyageContent
        {...props}
        logEntries={[
          {
            id: "entry-1",
            entry_date: "2026-03-01",
            text: "First matching photo",
            leg_id: null,
            stopover_id: null,
            photo_urls: ["https://example.com/shared.jpg"],
          } as never,
          {
            id: "entry-2",
            entry_date: "2026-04-01",
            text: "Second matching photo",
            leg_id: null,
            stopover_id: null,
            photo_urls: ["https://example.com/shared.jpg"],
          } as never,
        ]}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: messages.journal.openLabel }),
    );

    fireEvent.click(screen.getAllByRole("button", { name: "Open photo 1" })[1]);

    expect(screen.getByRole("dialog", { name: "Photo viewer" })).toBeTruthy();
    expect(screen.getByText("Second matching photo")).toBeTruthy();
    expect(screen.queryByText("First matching photo")).toBeNull();
    expect(screen.getByText(/1 April 2026/)).toBeTruthy();
  });

});
