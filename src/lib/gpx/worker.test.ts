import { describe, expect, it } from "vitest";
import type { WorkerInMessage, WorkerOutMessage } from "@/types/gpx";
import { processGpxFile, registerWorker, type WorkerScope } from "./worker";

const MULTI_TRACK_GPX = `<?xml version="1.0"?>
<gpx version="1.1">
  <trk><name>Day 1</name><trkseg>
    <trkpt lat="43.2965" lon="5.3698"><time>2026-03-10T08:00:00Z</time></trkpt>
    <trkpt lat="43.1242" lon="5.9280"><time>2026-03-10T16:00:00Z</time></trkpt>
  </trkseg></trk>
  <trk><name>Day 2</name><trkseg>
    <trkpt lat="43.1242" lon="5.9280"><time>2026-03-11T08:00:00Z</time></trkpt>
    <trkpt lat="43.5519" lon="7.0128"><time>2026-03-11T18:00:00Z</time></trkpt>
  </trkseg></trk>
</gpx>`;

const PREFIXED_NAMESPACE_GPX = `<?xml version="1.0"?>
<gpx:gpx xmlns:gpx="http://www.topografix.com/GPX/1/1" version="1.1">
  <gpx:trk>
    <gpx:name>Namespaced Track</gpx:name>
    <gpx:trkseg>
      <gpx:trkpt lat="43.0" lon="5.0">
        <gpx:time>2026-03-10T08:00:00Z</gpx:time>
      </gpx:trkpt>
      <gpx:trkpt lat="43.1" lon="5.1">
        <gpx:time>2026-03-10T08:30:00Z</gpx:time>
      </gpx:trkpt>
    </gpx:trkseg>
  </gpx:trk>
</gpx:gpx>`;

function createFile(contents: string) {
  return new File([contents], "track.gpx", { type: "application/gpx+xml" });
}

function createWorkerEvent(contents: string): MessageEvent<WorkerInMessage> {
  return {
    data: {
      type: "process",
      file: createFile(contents),
    },
  } as MessageEvent<WorkerInMessage>;
}

function createMockWorkerScope() {
  const messages: WorkerOutMessage[] = [];
  const scope: WorkerScope = {
    onmessage: null,
    postMessage: (message) => {
      messages.push(message);
    },
  };

  return { scope, messages };
}

describe("worker", () => {
  it("processes GPX through the full pipeline", async () => {
    const result = await processGpxFile(createFile(MULTI_TRACK_GPX));

    expect(result.tracks).toHaveLength(2);
    expect(result.stats).toHaveLength(2);
    expect(result.stopovers.length).toBeGreaterThan(0);
    expect(result.tracks[0].type).toBe("LineString");
    expect(result.tracks[0].coordinates[0]).toEqual([5.3698, 43.2965]);
    expect(result.stats[0].distanceNm).toBeGreaterThan(0);
    expect(result.stats[0].startTime).toBe("2026-03-10T08:00:00Z");
  });

  it("emits progress messages in order before the result", async () => {
    const { scope, messages } = createMockWorkerScope();
    registerWorker(scope);

    await scope.onmessage?.(createWorkerEvent(MULTI_TRACK_GPX));

    expect(messages).toHaveLength(5);
    expect(messages.slice(0, 4)).toEqual([
      { type: "progress", step: "parsing" },
      { type: "progress", step: "simplifying" },
      { type: "progress", step: "detecting" },
      { type: "progress", step: "ready" },
    ]);

    const resultMessage = messages[4];
    expect(resultMessage.type).toBe("result");
    if (resultMessage.type === "result") {
      expect(resultMessage.data.tracks).toHaveLength(2);
      expect(resultMessage.data.stats).toHaveLength(2);
    }
  });

  it("normalizes invalid GPX parsing failures for the main thread", async () => {
    const { scope, messages } = createMockWorkerScope();
    registerWorker(scope);

    await scope.onmessage?.(createWorkerEvent("<not valid xml>>>"));

    expect(messages).toEqual([
      { type: "progress", step: "parsing" },
      {
        type: "error",
        error: {
          code: "PROCESSING_ERROR",
          message: "Invalid GPX format",
        },
      },
    ]);
  });

  it("supports namespaced GPX input end-to-end", async () => {
    const result = await processGpxFile(createFile(PREFIXED_NAMESPACE_GPX));

    expect(result.tracks).toHaveLength(1);
    expect(result.tracks[0].coordinates).toEqual([
      [5, 43],
      [5.1, 43.1],
    ]);
    expect(result.stats[0].pointCount).toBe(2);
  });
});
