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
import { ImportProgress } from "./ImportProgress";
import { TrackPreview } from "./TrackPreview";

type ProgressStep = "parsing" | "simplifying" | "detecting" | "ready";

type ImportState =
  | { step: "idle" }
  | { step: "processing"; progress: ProgressStep }
  | { step: "preview"; result: ProcessingResult }
  | { step: "importing"; result: ProcessingResult }
  | { step: "error"; message: string };

type ImportAction =
  | { type: "FILE_SELECTED" }
  | { type: "PROGRESS"; progress: ProgressStep }
  | { type: "PROCESSING_COMPLETE"; result: ProcessingResult }
  | { type: "PROCESSING_ERROR"; message: string }
  | { type: "IMPORT_START"; result: ProcessingResult }
  | { type: "IMPORT_COMPLETE" }
  | { type: "IMPORT_ERROR"; message: string }
  | { type: "RETRY" };

function reducer(_state: ImportState, action: ImportAction): ImportState {
  switch (action.type) {
    case "FILE_SELECTED":
      return { step: "processing", progress: "parsing" };
    case "PROGRESS":
      return { step: "processing", progress: action.progress };
    case "PROCESSING_COMPLETE":
      return { step: "preview", result: action.result };
    case "PROCESSING_ERROR":
      return { step: "error", message: action.message };
    case "IMPORT_START":
      return { step: "importing", result: action.result };
    case "IMPORT_COMPLETE":
      return { step: "idle" };
    case "IMPORT_ERROR":
      return { step: "error", message: action.message };
    case "RETRY":
      return { step: "idle" };
  }
}

interface GpxImporterProps {
  voyageId: string;
  voyageName: string;
}

export function GpxImporter({ voyageId, voyageName }: GpxImporterProps) {
  const [state, dispatch] = useReducer(reducer, { step: "idle" });
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
          dispatch({
            type: "PROCESSING_COMPLETE",
            result: msg.data,
          });
          break;
        case "error":
          dispatch({
            type: "PROCESSING_ERROR",
            message: msg.error.message,
          });
          break;
      }
    };

    workerRef.current.onerror = (event) => {
      dispatch({
        type: "PROCESSING_ERROR",
        message: event.message || "Worker failed to load",
      });
    };

    return () => workerRef.current?.terminate();
  }, []);

  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file || !workerRef.current) return;

      dispatch({ type: "FILE_SELECTED" });

      try {
        // Parse XML on main thread (DOMParser is not available in workers)
        const xmlString = await file.text();
        const tracks = parseGpx(xmlString);

        // Send parsed tracks to worker for heavy computation
        workerRef.current.postMessage({ type: "process", tracks });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to parse GPX file";
        dispatch({ type: "PROCESSING_ERROR", message });
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
      if (state.step !== "preview") return;

      dispatch({ type: "IMPORT_START", result: state.result });

      const legs =
        merge && selectedIndices.length > 1
          ? [mergeTracksToSingleLeg(selectedIndices, state.result)]
          : selectedIndices.map((i) =>
              statsToLegData(
                state.result.tracks[i],
                state.result.stats[i],
              ),
            );

      const { error } = await importTracks({
        voyageId,
        legs,
      });

      if (error) {
        dispatch({ type: "IMPORT_ERROR", message: error.message });
        toast.error("Import failed \u2014 please try again");
        return;
      }

      dispatch({ type: "IMPORT_COMPLETE" });
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

  // Error state
  if (state.step === "error") {
    return (
      <ImportProgress
        currentStep="parsing"
        error={state.message}
        onRetry={handleRetry}
      />
    );
  }

  // Preview or importing state
  if (state.step === "preview" || state.step === "importing") {
    return (
      <TrackPreview
        result={state.step === "preview" ? state.result : state.result}
        onConfirm={handleConfirm}
        importing={state.step === "importing"}
      />
    );
  }

  return null;
}
