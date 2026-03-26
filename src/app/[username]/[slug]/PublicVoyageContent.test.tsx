import type { ReactNode } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Json } from "@/types/supabase";
import PublicVoyageContent from "./PublicVoyageContent";
import { messages } from "./messages";

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
    boatType: "Sloop",
    username: "seb",
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
  };

  it("keeps the closed mobile journal panel inert until opened", () => {
    const { container } = render(<PublicVoyageContent {...props} />);

    const closedPanel = container.querySelector('div[aria-hidden="true"][inert]');
    expect(closedPanel).toBeTruthy();

    fireEvent.click(
      screen.getByRole("button", { name: messages.journal.openLabel }),
    );

    const openPanel = container.querySelector('div[aria-hidden="false"]');
    expect(openPanel?.hasAttribute("inert")).toBe(false);
  });

  it("lays out the desktop sidebars horizontally at full height", () => {
    const { container } = render(<PublicVoyageContent {...props} />);

    const desktopSidebarLayout = container.firstElementChild?.firstElementChild;
    expect(desktopSidebarLayout?.className).toContain("lg:flex-row");
    expect(desktopSidebarLayout?.className).toContain("lg:h-full");
  });
});
