import type {
  GpxTrack,
  WorkerInMessage,
  WorkerOutMessage,
  ProcessingResult,
} from "@/types/gpx";
import { simplifyTrack } from "./simplify";
import { toGeoJsonLineString } from "./to-geojson";
import { computeTrackStats } from "@/lib/geo/distance";
import { detectStopovers } from "@/lib/geo/stopover-detection";

type ProgressStep = Extract<WorkerOutMessage, { type: "progress" }>["step"];
type WorkerError = Extract<WorkerOutMessage, { type: "error" }>["error"];

export interface WorkerScope {
  onmessage:
    | ((event: MessageEvent<WorkerInMessage>) => void | Promise<void>)
    | null;
  postMessage: (message: WorkerOutMessage) => void;
}

function postMsg(scope: WorkerScope, msg: WorkerOutMessage) {
  scope.postMessage(msg);
}

function toProcessingError(error: unknown): WorkerError {
  const message =
    error instanceof Error ? error.message : "Unknown processing error";
  return {
    code: "PROCESSING_ERROR",
    message,
  };
}

/**
 * Process pre-parsed GPX tracks through the heavy computation pipeline.
 * XML parsing (DOMParser) runs on the main thread; this function handles
 * simplification, stopover detection, stats, and GeoJSON conversion.
 */
export function processTracks(
  tracks: GpxTrack[],
  onProgress?: (step: ProgressStep) => void,
): ProcessingResult {
  // Step 1: Simplify
  onProgress?.("simplifying");
  const simplified = tracks.map((track) => ({
    ...track,
    simplifiedPoints: simplifyTrack(track.points),
    originalPointCount: track.points.length,
  }));

  // Step 2: Detect stopovers
  onProgress?.("detecting");
  const stopovers = detectStopovers(
    simplified.map((track) => ({ points: track.simplifiedPoints })),
  );

  // Step 3: Convert to GeoJSON + compute stats
  onProgress?.("ready");
  const geojsonTracks = simplified.map((track) =>
    toGeoJsonLineString(track.simplifiedPoints),
  );
  const stats = simplified.map((track) =>
    computeTrackStats(
      track.simplifiedPoints,
      track.originalPointCount,
      track.name,
    ),
  );

  return {
    tracks: geojsonTracks,
    stopovers,
    stats,
  };
}

export function registerWorker(
  scope: WorkerScope = self as unknown as WorkerScope,
) {
  scope.onmessage = async (event: MessageEvent<WorkerInMessage>) => {
    const { type, tracks } = event.data;
    if (type !== "process") return;

    try {
      const result = processTracks(tracks, (step) => {
        postMsg(scope, { type: "progress", step });
      });

      postMsg(scope, { type: "result", data: result });
    } catch (error) {
      postMsg(scope, {
        type: "error",
        error: toProcessingError(error),
      });
    }
  };
}

registerWorker();
