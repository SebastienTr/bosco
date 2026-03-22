import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RouteLayer } from "./RouteLayer";

const { fitBounds, latLngBounds } = vi.hoisted(() => ({
  fitBounds: vi.fn(),
  latLngBounds: vi.fn(() => "mock-bounds"),
}));

vi.mock("react-leaflet", () => ({
  Polyline: () => null,
  useMap: () => ({ fitBounds }),
}));

vi.mock("leaflet", () => ({
  default: {
    latLngBounds,
  },
}));

const tracks: GeoJSON.LineString[] = [
  {
    type: "LineString",
    coordinates: [
      [5.3698, 43.2965],
      [7.2619, 43.7102],
    ],
  },
];

describe("RouteLayer autoFitBounds", () => {
  beforeEach(() => {
    fitBounds.mockReset();
    latLngBounds.mockClear();
  });

  it("fits map bounds by default", () => {
    render(<RouteLayer tracks={tracks} />);

    expect(latLngBounds).toHaveBeenCalledOnce();
    expect(fitBounds).toHaveBeenCalledWith("mock-bounds", {
      padding: [20, 20],
    });
  });

  it("preserves the current view when auto-fit is disabled", () => {
    render(<RouteLayer tracks={tracks} skipAutoFit={true} />);

    expect(fitBounds).not.toHaveBeenCalled();
  });
});
