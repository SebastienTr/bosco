import { describe, it, expect } from "vitest";
import {
  classifyProcessingError,
  importReducer,
  type ImportState,
} from "./GpxImporter";
import { messages } from "@/app/voyage/[id]/import/messages";
import type { ProcessingResult } from "@/types/gpx";

// Minimal mock data for testing state transitions
const mockResult: ProcessingResult = {
  tracks: [],
  stats: [],
  stopovers: [],
};
const mockGeoNames: { name: string; country: string | null; country_code: string | null }[] = [];

describe("classifyProcessingError", () => {
  it("classifies 'not a valid gpx' as GPX format error", () => {
    const result = classifyProcessingError("This is not a valid GPX file");
    expect(result.title).toBe(messages.error.notGpx.title);
    expect(result.helpLink).toBeDefined();
    expect(result.helpLink?.href).toBe(messages.error.notGpx.helpHref);
  });

  it("classifies 'no <trk>' as GPX format error", () => {
    const result = classifyProcessingError("No <trk> elements found");
    expect(result.title).toBe(messages.error.notGpx.title);
  });

  it("classifies 'invalid xml' as GPX format error", () => {
    const result = classifyProcessingError("Invalid XML structure");
    expect(result.title).toBe(messages.error.notGpx.title);
  });

  it("classifies 'no tracks' as GPX format error", () => {
    const result = classifyProcessingError("No tracks in file");
    expect(result.title).toBe(messages.error.notGpx.title);
  });

  it("classifies unknown errors as processing failure", () => {
    const result = classifyProcessingError("Worker crashed unexpectedly");
    expect(result.title).toBe(messages.error.processingFailed.title);
    expect(result.helpLink).toBeUndefined();
  });
});

describe("importReducer", () => {
  describe("state preservation on import error", () => {
    it("preserves result and geoNames when IMPORT_ERROR fires", () => {
      const importingState: ImportState = {
        step: "importing",
        result: mockResult,
        geoNames: mockGeoNames,
      };

      const next = importReducer(importingState, {
        type: "IMPORT_ERROR",
        result: mockResult,
        geoNames: mockGeoNames,
      });

      expect(next.step).toBe("import-error");
      expect(next).toHaveProperty("result", mockResult);
      expect(next).toHaveProperty("geoNames", mockGeoNames);
    });

    it("RETRY from import-error restores preview state with data", () => {
      const errorState: ImportState = {
        step: "import-error",
        result: mockResult,
        geoNames: mockGeoNames,
      };

      const next = importReducer(errorState, { type: "RETRY" });

      expect(next.step).toBe("preview");
      expect(next).toHaveProperty("result", mockResult);
      expect(next).toHaveProperty("geoNames", mockGeoNames);
    });
  });

  describe("processing error resets to idle on retry", () => {
    it("RETRY from processing-error goes back to idle", () => {
      const errorState: ImportState = {
        step: "processing-error",
        errorInfo: { title: "Failed", description: "Oops" },
      };

      const next = importReducer(errorState, { type: "RETRY" });
      expect(next.step).toBe("idle");
    });
  });

  describe("basic state transitions", () => {
    it("FILE_SELECTED transitions to processing", () => {
      const next = importReducer({ step: "idle" }, { type: "FILE_SELECTED" });
      expect(next.step).toBe("processing");
    });

    it("PROCESSING_COMPLETE transitions to preview", () => {
      const next = importReducer(
        { step: "processing", progress: "parsing" },
        { type: "PROCESSING_COMPLETE", result: mockResult, geoNames: mockGeoNames },
      );
      expect(next.step).toBe("preview");
    });

    it("IMPORT_COMPLETE transitions to idle", () => {
      const next = importReducer(
        { step: "importing", result: mockResult, geoNames: mockGeoNames },
        { type: "IMPORT_COMPLETE" },
      );
      expect(next.step).toBe("idle");
    });
  });
});
