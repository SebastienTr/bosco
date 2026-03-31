"use client";

import { useReducer, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type {
  ProcessingResult,
  WorkerOutMessage,
} from "@/types/gpx";
import { parseGpx } from "@/lib/gpx/parser";
import { importTracks } from "@/app/voyage/[id]/import/actions";
import { mergeTracksToSingleLeg, statsToLegData } from "@/lib/gpx/import";
import { reverseGeocode } from "@/lib/geo/reverse-geocode-client";
import { messages as importMessages } from "@/app/voyage/[id]/import/messages";
import { showActionError } from "@/lib/toast-helpers";
import { ImportProgress, type ImportErrorInfo } from "./ImportProgress";
import { TrackPreview } from "./TrackPreview";

type ProgressStep = "parsing" | "simplifying" | "detecting" | "geocoding" | "ready";

/** Resolved stopover name from geocoding */
interface StopoverGeoInfo {
  name: string;
  country: string | null;
  country_code: string | null;
}

/** @internal Exported for testing only */
export type ImportState =
  | { step: "idle" }
  | { step: "processing"; progress: ProgressStep }
  | { step: "preview"; result: ProcessingResult; geoNames: StopoverGeoInfo[] }
  | { step: "importing"; result: ProcessingResult; geoNames: StopoverGeoInfo[] }
  | { step: "processing-error"; errorInfo: ImportErrorInfo }
  | { step: "import-error"; result: ProcessingResult; geoNames: StopoverGeoInfo[] };

type ImportAction =
  | { type: "FILE_SELECTED" }
  | { type: "PROGRESS"; progress: ProgressStep }
  | { type: "PROCESSING_COMPLETE"; result: ProcessingResult; geoNames: StopoverGeoInfo[] }
  | { type: "PROCESSING_ERROR"; errorInfo: ImportErrorInfo }
  | { type: "IMPORT_START"; result: ProcessingResult; geoNames: StopoverGeoInfo[] }
  | { type: "IMPORT_COMPLETE" }
  | { type: "IMPORT_ERROR"; result: ProcessingResult; geoNames: StopoverGeoInfo[] }
  | { type: "RETRY" };

/** @internal Exported for testing only */
export function classifyProcessingError(message: string): ImportErrorInfo {
  const lower = message.toLowerCase();
  if (lower.includes("not a valid gpx") || lower.includes("no <trk>") || lower.includes("invalid xml") || lower.includes("no tracks")) {
    return {
      title: importMessages.error.notGpx.title,
      description: importMessages.error.notGpx.description,
      helpLink: {
        label: importMessages.error.notGpx.helpLink,
        href: importMessages.error.notGpx.helpHref,
      },
    };
  }
  return {
    title: importMessages.error.processingFailed.title,
    description: importMessages.error.processingFailed.description,
  };
}

/** @internal Exported for testing only */
export function importReducer(state: ImportState, action: ImportAction): ImportState {
  switch (action.type) {
    case "FILE_SELECTED":
      return { step: "processing", progress: "parsing" };
    case "PROGRESS":
      return { step: "processing", progress: action.progress };
    case "PROCESSING_COMPLETE":
      return { step: "preview", result: action.result, geoNames: action.geoNames };
    case "PROCESSING_ERROR":
      return { step: "processing-error", errorInfo: action.errorInfo };
    case "IMPORT_START":
      return { step: "importing", result: action.result, geoNames: action.geoNames };
    case "IMPORT_COMPLETE":
      return { step: "idle" };
    case "IMPORT_ERROR":
      // Preserve preview data so user can retry without re-selecting file
      return { step: "import-error", result: action.result, geoNames: action.geoNames };
    case "RETRY":
      // If we had preview data, go back to preview; otherwise go to file picker
      if (state.step === "import-error") {
        return { step: "preview", result: state.result, geoNames: state.geoNames };
      }
      return { step: "idle" };
  }
}

interface GpxImporterProps {
  voyageId: string;
  voyageName: string;
  autoImportFromShare?: boolean;
}

const SHARE_CACHE = "bosco-share-target";
const SHARE_KEY = "/shared-gpx";

async function geocodeStopovers(result: ProcessingResult): Promise<StopoverGeoInfo[]> {
  const names: StopoverGeoInfo[] = [];
  for (const candidate of result.stopovers) {
    const [lon, lat] = candidate.position;
    try {
      const geo = await reverseGeocode(lat, lon);
      names.push({ name: geo.name, country: geo.country, country_code: geo.country_code });
    } catch {
      names.push({ name: "", country: null, country_code: null });
    }
  }
  return names;
}

export function GpxImporter({ voyageId, voyageName, autoImportFromShare }: GpxImporterProps) {
  const [state, dispatch] = useReducer(importReducer, { step: "idle" });
  const workerRef = useRef<Worker | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    workerRef.current = new Worker(
      new URL("@/lib/gpx/worker.ts", import.meta.url),
    );

    workerRef.current.onmessage = (
      event: MessageEvent<WorkerOutMessage>,
    ) => {
      const msg = event.data;
      switch (msg.type) {
        case "progress":
          dispatch({ type: "PROGRESS", progress: msg.step });
          break;
        case "result":
          // Geocode stopovers client-side before showing preview
          dispatch({ type: "PROGRESS", progress: "geocoding" });
          geocodeStopovers(msg.data).then((geoNames) => {
            dispatch({
              type: "PROCESSING_COMPLETE",
              result: msg.data,
              geoNames,
            });
          });
          break;
        case "error":
          dispatch({
            type: "PROCESSING_ERROR",
            errorInfo: classifyProcessingError(msg.error.message),
          });
          break;
      }
    };

    workerRef.current.onerror = (event) => {
      dispatch({
        type: "PROCESSING_ERROR",
        errorInfo: classifyProcessingError(event.message || "Worker failed to load"),
      });
    };

    return () => workerRef.current?.terminate();
  }, []);

  // Auto-import from Web Share Target Cache API
  // NOTE: Do NOT delete the cache entry here — React Strict Mode double-mounts
  // in development, so the second mount would find an empty cache. Cleanup
  // happens after successful import in handleConfirm.
  useEffect(() => {
    if (!autoImportFromShare) return;
    let cancelled = false;

    async function loadSharedFile() {
      if (!workerRef.current) return;
      if (!("caches" in window)) return;

      try {
        const cache = await caches.open(SHARE_CACHE);
        const response = await cache.match(SHARE_KEY);
        if (!response || cancelled) return;
        const blob = await response.blob();
        const file = new File([blob], "shared.gpx", { type: "application/gpx+xml" });

        if (cancelled) return;
        dispatch({ type: "FILE_SELECTED" });
        const xmlString = await file.text();
        const tracks = parseGpx(xmlString);
        workerRef.current?.postMessage({ type: "process", tracks });
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : "Failed to load shared file";
        dispatch({ type: "PROCESSING_ERROR", errorInfo: classifyProcessingError(message) });
      }
    }

    loadSharedFile();
    return () => { cancelled = true; };
  }, [autoImportFromShare]);

  const MAX_FILE_SIZE_MB = 400;
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file || !workerRef.current) return;

      // Guard: file size limit
      if (file.size > MAX_FILE_SIZE_BYTES) {
        const sizeMb = Math.round(file.size / (1024 * 1024));
        dispatch({
          type: "PROCESSING_ERROR",
          errorInfo: {
            title: importMessages.error.tooLarge.title(sizeMb),
            description: importMessages.error.tooLarge.description,
          },
        });
        return;
      }

      dispatch({ type: "FILE_SELECTED" });

      try {
        // Parse XML on main thread (DOMParser is not available in workers)
        const xmlString = await file.text();
        const tracks = parseGpx(xmlString);

        // Send parsed tracks to worker for heavy computation
        workerRef.current.postMessage({ type: "process", tracks });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to parse GPX file";
        dispatch({ type: "PROCESSING_ERROR", errorInfo: classifyProcessingError(message) });
      }
    },
    [],
  );

  const handleRetry = useCallback(() => {
    dispatch({ type: "RETRY" });
    // Reset file input to allow re-selecting the same file
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const handleConfirm = useCallback(
    async (selectedIndices: number[], merge: boolean) => {
      if (state.step !== "preview" && state.step !== "import-error") return;

      dispatch({ type: "IMPORT_START", result: state.result, geoNames: state.geoNames });

      const legs =
        merge && selectedIndices.length > 1
          ? [mergeTracksToSingleLeg(selectedIndices, state.result)]
          : selectedIndices.map((i) =>
              statsToLegData(
                state.result.tracks[i],
                state.result.stats[i],
              ),
            );

      // Map stopovers from ProcessingResult to import format with timing derivation
      const stopoverInputs = state.result.stopovers.map((candidate, idx) => {
        let arrived_at: string | null = null;
        let departed_at: string | null = null;

        if (candidate.type === "departure") {
          const tIdx = Math.min(...candidate.trackIndices);
          departed_at = state.result.stats[tIdx]?.startTime ?? null;
        } else if (candidate.type === "arrival") {
          const tIdx = Math.max(...candidate.trackIndices);
          arrived_at = state.result.stats[tIdx]?.endTime ?? null;
        } else {
          // waypoint: arriving track ends here, departing track starts here
          const sorted = [...candidate.trackIndices].sort((a, b) => a - b);
          if (sorted.length >= 2) {
            arrived_at = state.result.stats[sorted[0]]?.endTime ?? null;
            departed_at = state.result.stats[sorted[1]]?.startTime ?? null;
          } else if (sorted.length === 1) {
            arrived_at = state.result.stats[sorted[0]]?.endTime ?? null;
          }
        }

        const geo = state.geoNames[idx];
        return {
          longitude: candidate.position[0],
          latitude: candidate.position[1],
          type: candidate.type,
          trackIndices: candidate.trackIndices,
          arrived_at,
          departed_at,
          name: geo?.name || null,
          country: geo?.country || null,
          country_code: geo?.country_code || null,
        };
      });

      const { error } = await importTracks({
        voyageId,
        legs,
        stopovers: stopoverInputs,
      });

      if (error) {
        dispatch({
          type: "IMPORT_ERROR",
          result: state.result,
          geoNames: state.geoNames,
        });
        const isNetwork = error.code === "EXTERNAL_SERVICE_ERROR";
        showActionError(error, {
          message: isNetwork
            ? importMessages.error.networkError.title
            : importMessages.error.importFailed,
          description: isNetwork
            ? importMessages.error.networkError.description
            : undefined,
          onRetry: isNetwork
            ? () => handleConfirm(selectedIndices, merge)
            : undefined,
        });
        return;
      }

      dispatch({ type: "IMPORT_COMPLETE" });
      // Clean up share cache after successful import
      if ("caches" in window) {
        caches
          .open(SHARE_CACHE)
          .then((cache) => cache.delete(SHARE_KEY))
          .catch(() => {});
      }
      toast.success(
        `${legs.length} track(s) added to ${voyageName}`,
      );
      router.push(`/voyage/${voyageId}`);
    },
    [state, voyageId, voyageName, router],
  );

  // Idle state — file picker
  if (state.step === "idle") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-6 px-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-ocean/10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-ocean"
          >
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="12" x2="12" y1="18" y2="12" />
            <line x1="9" x2="15" y1="15" y2="15" />
          </svg>
        </div>
        <div className="text-center">
          <p className="font-heading text-h1 text-navy">
            Select GPX file
          </p>
          <p className="mt-2 text-body text-mist">
            GPX 1.1 files up to 400 MB
          </p>
        </div>
        <label className="min-h-[44px] cursor-pointer rounded-[var(--radius-button)] bg-coral px-8 py-3 font-semibold text-white transition-colors hover:bg-coral/90">
          Choose file
          <input
            ref={fileInputRef}
            type="file"
            accept=".gpx"
            onChange={handleFileSelect}
            className="sr-only"
          />
        </label>
      </div>
    );
  }

  // Processing state
  if (state.step === "processing") {
    return (
      <ImportProgress
        currentStep={state.progress}
        onRetry={handleRetry}
      />
    );
  }

  // Processing error state — file-level failure, must re-select
  if (state.step === "processing-error") {
    return (
      <ImportProgress
        currentStep="parsing"
        error={state.errorInfo}
        onRetry={handleRetry}
      />
    );
  }

  // Preview, importing, or import-error state — preserve track preview
  if (state.step === "preview" || state.step === "importing" || state.step === "import-error") {
    return (
      <TrackPreview
        result={state.result}
        onConfirm={handleConfirm}
        importing={state.step === "importing"}
      />
    );
  }

  return null;
}
