import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import L from "leaflet";
import "leaflet.markercluster";

const mockBounds = {
  contains: vi.fn(() => true),
};

const mockMap = {
  getBounds: vi.fn(() => mockBounds),
  on: vi.fn(),
  off: vi.fn(),
  getContainer: vi.fn(() => document.createElement("div")),
};

vi.mock("react-leaflet-cluster", () => ({
  default: vi.fn(({ children }: { children: React.ReactNode }) => children),
}));

vi.mock("react-leaflet", () => ({
  Marker: vi.fn(() => null),
  useMap: () => mockMap,
}));

vi.mock("react-leaflet-cluster/dist/assets/MarkerCluster.css", () => ({}));

const mockPhotoMarker = vi.fn((_props: Record<string, unknown>) => null);
vi.mock("./PhotoMarker", () => ({
  PhotoMarker: (props: Record<string, unknown>) => mockPhotoMarker(props),
}));

import { render } from "@testing-library/react";
import {
  applyClusterMarkerAccessibility,
  countVisiblePhotoMarkers,
  PhotoMarkerCluster,
  PHOTO_CLUSTER_THRESHOLD,
} from "./PhotoMarkerCluster";
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
    mockBounds.contains.mockReset();
    mockBounds.contains.mockReturnValue(true);
    mockMap.getBounds.mockClear();
    mockMap.on.mockClear();
    mockMap.off.mockClear();
    mockMap.getContainer.mockReset();
    mockMap.getContainer.mockReturnValue(document.createElement("div"));
  });

  function makeMarkers(count: number) {
    return Array.from({ length: count }, (_, index) => ({
      entryId: `e${index + 1}`,
      position: [9.5 + index * 0.01, 41.0 + index * 0.01] as [number, number],
      photoUrl: `https://example.com/photo-${index + 1}.jpg`,
      label: `Photo ${index + 1}`,
    }));
  }

  it("renders MarkerClusterGroup when visible markers exceed the threshold", () => {
    const onTap = vi.fn();
    const markers = makeMarkers(PHOTO_CLUSTER_THRESHOLD + 1);
    render(
      <PhotoMarkerCluster photoMarkers={markers} onTap={onTap} />,
    );

    expect(MarkerClusterGroup).toHaveBeenCalled();
    const call = vi.mocked(MarkerClusterGroup).mock.calls[0];
    const props = call[0] as unknown as Record<string, unknown>;
    expect(props.iconCreateFunction).toBeDefined();
    expect(props.zoomToBoundsOnClick).toBe(true);
    expect(props.showCoverageOnHover).toBe(false);
  });

  it("renders individual PhotoMarkers when visible markers stay at or below the threshold", () => {
    const onTap = vi.fn();
    const markers = makeMarkers(PHOTO_CLUSTER_THRESHOLD + 1);

    mockBounds.contains.mockImplementation((latLng: L.LatLng) => latLng.lat < 41.05);

    render(
      <PhotoMarkerCluster photoMarkers={markers} onTap={onTap} />,
    );

    expect(MarkerClusterGroup).not.toHaveBeenCalled();
    expect(mockPhotoMarker).toHaveBeenCalledTimes(PHOTO_CLUSTER_THRESHOLD + 1);
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
      <PhotoMarkerCluster
        photoMarkers={makeMarkers(PHOTO_CLUSTER_THRESHOLD + 1)}
        onTap={onTap}
      />,
    );

    for (const call of mockPhotoMarker.mock.calls) {
      expect(call[0].onTap).toBe(onTap);
    }
  });

  it("counts only markers inside the current map bounds", () => {
    const map = {
      getBounds: () => ({
        contains: (latLng: L.LatLng) => latLng.lat <= 41,
      }),
    } as Pick<L.Map, "getBounds">;

    expect(countVisiblePhotoMarkers(map, sampleMarkers)).toBe(1);
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
        photoMarkers={Array.from(
          { length: PHOTO_CLUSTER_THRESHOLD + 1 },
          (_, index) => ({
            entryId: `e${index + 1}`,
            position: [index, index],
            photoUrl: `https://example.com/photo-${index + 1}.jpg`,
            label: `Test ${index + 1}`,
          }),
        )}
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

  it("stores the photo count in the cluster HTML for accessibility sync", () => {
    const createIcon = getIconCreateFunction();
    const icon = createIcon(makeCluster(12));

    expect(icon.options.html).toContain('data-photo-count="12"');
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

describe("applyClusterMarkerAccessibility", () => {
  it("adds and updates button semantics for rendered cluster markers", () => {
    const container = document.createElement("div");
    const parent = document.createElement("div");
    const cluster = document.createElement("div");

    parent.className = "leaflet-marker-icon";
    cluster.className = "bosco-photo-cluster";
    cluster.dataset.photoCount = "3";
    parent.appendChild(cluster);
    container.appendChild(parent);

    applyClusterMarkerAccessibility(container);

    expect(parent.getAttribute("role")).toBe("button");
    expect(parent.getAttribute("tabindex")).toBe("0");
    expect(parent.getAttribute("aria-label")).toBe(
      "Photo cluster with 3 photos — tap to expand",
    );
    expect(parent.classList.contains("bosco-photo-cluster-marker")).toBe(true);

    cluster.dataset.photoCount = "5";
    applyClusterMarkerAccessibility(container);

    expect(parent.getAttribute("aria-label")).toBe(
      "Photo cluster with 5 photos — tap to expand",
    );
  });
});
