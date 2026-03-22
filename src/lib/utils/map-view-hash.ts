export interface MapViewState {
  center: [number, number];
  zoom: number;
}

const MAP_HASH_PATTERN = /^#map=(\d+)\/([-\d.]+)\/([-\d.]+)$/;

export function parseMapHash(hash: string): MapViewState | null {
  const match = hash.match(MAP_HASH_PATTERN);

  if (!match) {
    return null;
  }

  const zoom = Number.parseInt(match[1], 10);
  const latitude = Number.parseFloat(match[2]);
  const longitude = Number.parseFloat(match[3]);

  if ([zoom, latitude, longitude].some(Number.isNaN)) {
    return null;
  }

  return {
    zoom,
    center: [latitude, longitude],
  };
}

export function formatMapHash(
  zoom: number,
  center: [number, number] | { lat: number; lng: number },
) {
  const [latitude, longitude] = Array.isArray(center)
    ? center
    : [center.lat, center.lng];

  return `#map=${zoom}/${latitude.toFixed(4)}/${longitude.toFixed(4)}`;
}
