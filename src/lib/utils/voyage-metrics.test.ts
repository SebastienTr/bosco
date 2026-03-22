import { describe, expect, it } from "vitest";
import { getVoyageMetrics } from "./voyage-metrics";

describe("getVoyageMetrics", () => {
  it("returns aggregate stats and journey dates", () => {
    expect(
      getVoyageMetrics(
        [
          {
            distance_nm: 42.5,
            started_at: "2026-03-10T06:00:00Z",
            ended_at: "2026-03-10T18:00:00Z",
          },
          {
            distance_nm: 57.25,
            started_at: "2026-03-12T08:00:00Z",
            ended_at: "2026-03-14T09:30:00Z",
          },
        ],
        [
          { country: "France" },
          { country: "Spain" },
          { country: "France" },
          { country: null },
        ],
      ),
    ).toEqual({
      totalDistanceNm: 99.75,
      days: 5,
      portsCount: 4,
      countriesCount: 2,
      firstDate: "2026-03-10T06:00:00Z",
      lastDate: "2026-03-14T09:30:00Z",
    });
  });

  it("handles voyages without dated legs", () => {
    expect(
      getVoyageMetrics(
        [{ distance_nm: 12, started_at: null, ended_at: null }],
        [{ country: null }],
      ),
    ).toEqual({
      totalDistanceNm: 12,
      days: 0,
      portsCount: 1,
      countriesCount: 0,
      firstDate: null,
      lastDate: null,
    });
  });
});
