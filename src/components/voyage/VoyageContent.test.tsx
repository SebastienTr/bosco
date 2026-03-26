import type { ReactNode } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { VoyageContent } from "./VoyageContent";

vi.mock("next/dynamic", () => ({
  default: () => () => null,
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

vi.mock("@/components/map/MapLoader", () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/shared/EmptyState", () => ({
  EmptyState: () => <div>Empty state</div>,
}));

vi.mock("@/components/voyage/StopoverPanel", () => ({
  StopoverPanel: ({
    isOpen,
    onToggle,
  }: {
    isOpen: boolean;
    onToggle: () => void;
  }) => (
    <div>
      <button onClick={onToggle}>toggle-stopovers</button>
      <span>{isOpen ? "stopovers-open" : "stopovers-closed"}</span>
    </div>
  ),
}));

vi.mock("@/components/voyage/LegList", () => ({
  LegList: ({
    isOpen,
    onToggle,
  }: {
    isOpen: boolean;
    onToggle: () => void;
  }) => (
    <div>
      <button onClick={onToggle}>toggle-legs</button>
      <span>{isOpen ? "legs-open" : "legs-closed"}</span>
    </div>
  ),
}));

vi.mock("@/components/log/JournalSection", () => ({
  JournalSection: ({
    isOpen,
    onToggle,
  }: {
    isOpen: boolean;
    onToggle: () => void;
  }) => (
    <div>
      <button onClick={onToggle}>toggle-journal</button>
      <span>{isOpen ? "journal-open" : "journal-closed"}</span>
    </div>
  ),
}));

vi.mock("@/app/voyage/[id]/actions", () => ({
  deleteLeg: vi.fn(),
}));

vi.mock("@/app/voyage/[id]/stopover/actions", () => ({
  regeocodeUnnamed: vi.fn(() => Promise.resolve({ data: [], error: null })),
}));

describe("VoyageContent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("keeps at most one voyage overlay open at a time", () => {
    render(
      <VoyageContent
        initialLegs={
          [
            {
              id: "leg-1",
              track_geojson: { type: "LineString", coordinates: [] },
              started_at: null,
            } as never,
          ]
        }
        stopovers={
          [
            {
              id: "stopover-1",
              name: "Marseille",
              latitude: 43.2965,
              longitude: 5.3698,
            } as never,
          ]
        }
        voyageId="voyage-1"
        initialLogEntries={[]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "toggle-stopovers" }));
    expect(screen.getByText("stopovers-open")).toBeTruthy();
    expect(screen.getByText("legs-closed")).toBeTruthy();
    expect(screen.getByText("journal-closed")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "toggle-legs" }));
    expect(screen.getByText("stopovers-closed")).toBeTruthy();
    expect(screen.getByText("legs-open")).toBeTruthy();
    expect(screen.getByText("journal-closed")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "toggle-journal" }));
    expect(screen.getByText("stopovers-closed")).toBeTruthy();
    expect(screen.getByText("legs-closed")).toBeTruthy();
    expect(screen.getByText("journal-open")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "toggle-journal" }));
    expect(screen.getByText("journal-closed")).toBeTruthy();
  });
});
