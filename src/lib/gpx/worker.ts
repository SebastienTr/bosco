import type {
  WorkerInMessage,
  WorkerOutMessage,
  ProcessingResult,
} from "@/types/gpx";
import { INVALID_GPX_FORMAT_MESSAGE, parseGpx } from "./parser";
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
  if (
    error instanceof Error &&
    error.message.startsWith(INVALID_GPX_FORMAT_MESSAGE)
  ) {
    return {
      code: "PROCESSING_ERROR",
      message: INVALID_GPX_FORMAT_MESSAGE,
    };
  }

  return {
    code: "PROCESSING_ERROR",
    message: "Unknown processing error",
  };
}

export async function processGpxFile(
  file: File,
  onProgress?: (step: ProgressStep) => void
): Promise<ProcessingResult> {
  // Step 1: Parse
  onProgress?.("parsing");
  const xmlString = await file.text();
  const tracks = parseGpx(xmlString);

  // Step 2: Simplify
  onProgress?.("simplifying");
  const simplified = tracks.map((track) => ({
    ...track,
    simplifiedPoints: simplifyTrack(track.points),
    originalPointCount: track.points.length,
  }));

  // Step 3: Detect stopovers
  onProgress?.("detecting");
  const stopovers = detectStopovers(
    simplified.map((track) => ({ points: track.simplifiedPoints }))
  );

  // Step 4: Convert to GeoJSON + compute stats
  onProgress?.("ready");
  const geojsonTracks = simplified.map((track) =>
    toGeoJsonLineString(track.simplifiedPoints)
  );
  const stats = simplified.map((track) =>
    computeTrackStats(track.simplifiedPoints, track.originalPointCount)
  );

  return {
    tracks: geojsonTracks,
    stopovers,
    stats,
  };
}

export function registerWorker(scope: WorkerScope = self as unknown as WorkerScope) {
  scope.onmessage = async (event: MessageEvent<WorkerInMessage>) => {
    const { type, file } = event.data;
    if (type !== "process") return;

    try {
      const result = await processGpxFile(file, (step) => {
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
