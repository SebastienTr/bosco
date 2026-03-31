import { describe, it, expect, vi, beforeEach } from "vitest";
import { showActionError } from "./toast-helpers";
import type { ActionError } from "@/types";

// Mock sonner
const mockToastError = vi.fn();
vi.mock("sonner", () => ({
  toast: {
    error: (...args: unknown[]) => mockToastError(...args),
  },
}));

describe("showActionError", () => {
  beforeEach(() => {
    mockToastError.mockClear();
  });

  it("calls toast.error with default message from error code", () => {
    const error: ActionError = { code: "PROCESSING_ERROR", message: "server msg" };
    showActionError(error);

    expect(mockToastError).toHaveBeenCalledTimes(1);
    expect(mockToastError).toHaveBeenCalledWith("Processing failed", {
      description: "We couldn't process your request. Please try again.",
      duration: Infinity,
      action: undefined,
    });
  });

  it("uses override message when provided", () => {
    const error: ActionError = { code: "PROCESSING_ERROR", message: "" };
    showActionError(error, { message: "Custom title" });

    expect(mockToastError).toHaveBeenCalledWith("Custom title", expect.objectContaining({
      description: "We couldn't process your request. Please try again.",
    }));
  });

  it("uses override description when provided", () => {
    const error: ActionError = { code: "NOT_FOUND", message: "" };
    showActionError(error, { description: "The voyage was deleted." });

    expect(mockToastError).toHaveBeenCalledWith("Not found", expect.objectContaining({
      description: "The voyage was deleted.",
    }));
  });

  it("sets duration to Infinity (persistent toast)", () => {
    const error: ActionError = { code: "VALIDATION_ERROR", message: "" };
    showActionError(error);

    expect(mockToastError).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ duration: Infinity }),
    );
  });

  it("shows Retry action button when onRetry is provided", () => {
    const retry = vi.fn();
    const error: ActionError = { code: "EXTERNAL_SERVICE_ERROR", message: "" };
    showActionError(error, { onRetry: retry });

    expect(mockToastError).toHaveBeenCalledWith(
      "Connection problem",
      expect.objectContaining({
        action: { label: "Retry", onClick: retry },
      }),
    );
  });

  it("does not show action button without onRetry", () => {
    const error: ActionError = { code: "EXTERNAL_SERVICE_ERROR", message: "" };
    showActionError(error);

    expect(mockToastError).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ action: undefined }),
    );
  });

  it("maps all error codes to user-friendly messages", () => {
    const codes: Array<{ code: ActionError["code"]; expected: string }> = [
      { code: "VALIDATION_ERROR", expected: "Invalid input" },
      { code: "NOT_FOUND", expected: "Not found" },
      { code: "UNAUTHORIZED", expected: "Sign in required" },
      { code: "FORBIDDEN", expected: "Access denied" },
      { code: "EXTERNAL_SERVICE_ERROR", expected: "Connection problem" },
      { code: "PROCESSING_ERROR", expected: "Processing failed" },
    ];

    for (const { code, expected } of codes) {
      mockToastError.mockClear();
      showActionError({ code, message: "raw" });
      expect(mockToastError).toHaveBeenCalledWith(expected, expect.any(Object));
    }
  });
});
