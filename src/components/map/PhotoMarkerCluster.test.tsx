import { describe, it, expect, vi, beforeEach } from "vitest";
import L from "leaflet";
import "leaflet.markercluster";

vi.mock("react-leaflet-cluster", () => ({
  default: vi.fn(({ children }: { children: React.ReactNode }) => children),
}));

vi.mock("react-leaflet", () => ({
  Marker: vi.fn(() => null),
}));

vi.mock("react-leaflet-cluster/dist/assets/MarkerCluster.css", () => ({}));

const mockPhotoMarker = vi.fn((_props: Record<string, unknown>) => null);
vi.mock("./PhotoMarker", () => ({
  PhotoMarker: (props: Record<string, unknown>) => mockPhotoMarker(props),
}));

import React from "react";
import { render } from "@testing-library/react";
import { PhotoMarkerCluster } from "./PhotoMarkerCluster";
import MarkerClusterGroup from "react-leaflet-cluster";

describe("PhotoMarkerCluster", () => {
  const sampleMarkers = [
    {
      entryId: "e1",
      position: [9.5, 41.0] as [number, number],
      photoUrl: "https://example.com/photo1.jpg",
      label: "Porto Cervo",
    },
    {
      entryId: "e2",
      position: [10.0, 42.0] as [number, number],
      photoUrl: "https://example.com/photo2.jpg",
      label: "Leg 1",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders MarkerClusterGroup with correct props", () => {
    const onTap = vi.fn();
    render(
      <PhotoMarkerCluster photoMarkers={sampleMarkers} onTap={onTap} />,
    );

    expect(MarkerClusterGroup).toHaveBeenCalled();
    const call = vi.mocked(MarkerClusterGroup).mock.calls[0];
    const props = call[0] as unknown as Record<string, unknown>;
    expect(props.iconCreateFunction).toBeDefined();
    expect(props.zoomToBoundsOnClick).toBe(true);
    expect(props.showCoverageOnHover).toBe(false);
  });

  it("renders correct number of PhotoMarker children", () => {
    const onTap = vi.fn();
    render(
      <PhotoMarkerCluster photoMarkers={sampleMarkers} onTap={onTap} />,
    );

    expect(mockPhotoMarker).toHaveBeenCalledTimes(2);
    expect(mockPhotoMarker).toHaveBeenCalledWith(
      expect.objectContaining({
        position: [9.5, 41.0],
        photoUrl: "https://example.com/photo1.jpg",
        label: "Porto Cervo",
        onTap,
      }),
    );
  });

  it("returns null when photoMarkers is empty", () => {
    const onTap = vi.fn();
    const { container } = render(
      <PhotoMarkerCluster photoMarkers={[]} onTap={onTap} />,
    );

    expect(container.innerHTML).toBe("");
    expect(MarkerClusterGroup).not.toHaveBeenCalled();
  });

  it("passes onTap to each PhotoMarker", () => {
    const onTap = vi.fn();
    render(
      <PhotoMarkerCluster photoMarkers={sampleMarkers} onTap={onTap} />,
    );

    for (const call of mockPhotoMarker.mock.calls) {
      expect(call[0].onTap).toBe(onTap);
    }
  });
});

describe("createClusterIcon", () => {
  function makeCluster(count: number): L.MarkerCluster {
    return {
      getChildCount: () => count,
    } as unknown as L.MarkerCluster;
  }

  function getIconCreateFunction(): (cluster: L.MarkerCluster) => L.DivIcon {
    vi.mocked(MarkerClusterGroup).mockClear();
    const onTap = vi.fn();
    render(
      <PhotoMarkerCluster
        photoMarkers={[
          {
            entryId: "e1",
            position: [0, 0],
            photoUrl: "https://example.com/photo.jpg",
            label: "Test",
          },
        ]}
        onTap={onTap}
      />,
    );

    const call = vi.mocked(MarkerClusterGroup).mock.calls.at(-1)!;
    const props = call[0] as unknown as Record<string, unknown>;
    return props.iconCreateFunction as (
      cluster: L.MarkerCluster,
    ) => L.DivIcon;
  }

  it("creates small icon for count < 10", () => {
    const createIcon = getIconCreateFunction();
    const icon = createIcon(makeCluster(5));

    expect(icon.options.iconSize).toEqual(L.point(36, 36, true));
    expect(icon.options.html).toContain(">5</span>");
    expect(icon.options.html).toContain("font-size: 13px");
  });

  it("creates medium icon for count 10-49", () => {
    const createIcon = getIconCreateFunction();
    const icon = createIcon(makeCluster(25));

    expect(icon.options.iconSize).toEqual(L.point(44, 44, true));
    expect(icon.options.html).toContain(">25</span>");
    expect(icon.options.html).toContain("font-size: 15px");
  });

  it("creates large icon for count >= 50", () => {
    const createIcon = getIconCreateFunction();
    const icon = createIcon(makeCluster(100));

    expect(icon.options.iconSize).toEqual(L.point(52, 52, true));
    expect(icon.options.html).toContain(">100</span>");
    expect(icon.options.html).toContain("font-size: 17px");
  });

  it("uses empty className to avoid default Leaflet styling", () => {
    const createIcon = getIconCreateFunction();
    const icon = createIcon(makeCluster(3));

    expect(icon.options.className).toBe("");
  });

  it("includes Bosco navy background in cluster HTML", () => {
    const createIcon = getIconCreateFunction();
    const icon = createIcon(makeCluster(10));

    expect(icon.options.html).toContain("rgba(27, 45, 79, 0.85)");
    expect(icon.options.html).toContain("border: 2px solid white");
    expect(icon.options.html).toContain("bosco-photo-cluster");
  });
});
