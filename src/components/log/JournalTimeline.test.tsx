import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { JournalTimeline } from "./JournalTimeline";

vi.mock("next/image", () => ({
  default: () => null,
}));

describe("JournalTimeline", () => {
  it("derives public leg labels from chronological order when legs are unsorted", () => {
    render(
      <JournalTimeline
        entries={[
          {
            id: "entry-1",
            entry_date: "2026-03-01",
            text: "Left the harbor before sunrise.",
            leg_id: "leg-1",
            stopover_id: null,
            photo_urls: [],
          } as never,
        ]}
        stopovers={[]}
        legs={[
          { id: "leg-2", sort_order: 2, started_at: "2026-03-03T08:00:00.000Z" },
          { id: "leg-1", sort_order: 1, started_at: "2026-03-01T08:00:00.000Z" },
        ]}
      />,
    );

    expect(screen.getByText("Leg 1")).toBeTruthy();
    expect(screen.queryByText("Leg 2")).toBeNull();
  });
});
