import { describe, expect, it } from "vitest";
import type { Leg } from "@/lib/data/legs";
import { removeLegFromState, restoreLegToState } from "./leg-state";

function makeLeg(id: string): Leg {
  return {
    id,
    voyage_id: "voyage-1",
    track_geojson: { type: "LineString", coordinates: [] },
    avg_speed_kts: null,
    created_at: "2026-03-16T00:00:00.000Z",
    distance_nm: null,
    duration_seconds: null,
    ended_at: null,
    max_speed_kts: null,
    started_at: null,
  };
}

describe("leg-state", () => {
  it("restores an optimistically removed leg at its original position", () => {
    const legs = [makeLeg("leg-1"), makeLeg("leg-2"), makeLeg("leg-3")];

    const snapshot = removeLegFromState(legs, "leg-2");

    expect(snapshot.nextLegs.map((leg) => leg.id)).toEqual(["leg-1", "leg-3"]);
    expect(restoreLegToState(snapshot.nextLegs, snapshot).map((leg) => leg.id))
      .toEqual(["leg-1", "leg-2", "leg-3"]);
  });

  it("leaves state unchanged when the requested leg does not exist", () => {
    const legs = [makeLeg("leg-1"), makeLeg("leg-2")];

    const snapshot = removeLegFromState(legs, "leg-999");

    expect(snapshot.nextLegs).toBe(legs);
    expect(restoreLegToState(legs, snapshot)).toBe(legs);
  });
});
