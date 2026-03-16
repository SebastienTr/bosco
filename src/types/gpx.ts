/** Raw parsed track point from GPX XML */
export interface GpxTrackPoint {
  lat: number;
  lon: number;
  ele: number | null;
  time: string | null; // ISO 8601 timestamp from GPX
}

/** Raw parsed track from GPX XML */
export interface GpxTrack {
  name: string | null; // <name> element from GPX
  points: GpxTrackPoint[]; // Flattened from all <trkseg> in this <trk>
}

/** Stats computed per track after simplification */
export interface TrackStats {
  name: string | null;
  distanceNm: number;
  durationSeconds: number | null; // null if no timestamps in GPX
  avgSpeedKts: number | null;
  maxSpeedKts: number | null;
  startTime: string | null; // ISO 8601
  endTime: string | null; // ISO 8601
  pointCount: number; // After simplification
  originalPointCount: number; // Before simplification
}

/** Detected stopover candidate (not yet persisted) */
export interface StopoverCandidate {
  position: [number, number]; // [longitude, latitude] — GeoJSON order
  trackIndices: number[]; // Which tracks start/end here
  type: "departure" | "arrival" | "waypoint"; // First track start, last track end, or shared endpoint
}

/** Complete processing result from worker */
export interface ProcessingResult {
  tracks: GeoJSON.LineString[];
  stopovers: StopoverCandidate[];
  stats: TrackStats[];
}

/** Messages: Main thread → Worker */
export type WorkerInMessage = {
  type: "process";
  tracks: GpxTrack[];
};

/** Messages: Worker → Main thread */
export type WorkerOutMessage =
  | {
      type: "progress";
      step: "parsing" | "simplifying" | "detecting" | "ready";
    }
  | { type: "result"; data: ProcessingResult }
  | { type: "error"; error: { code: string; message: string } };
