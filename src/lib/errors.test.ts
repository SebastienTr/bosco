import { describe, it, expect } from "vitest";
import { getUserErrorMessage } from "./errors";
import type { ActionError, ErrorCode } from "@/types";

describe("getUserErrorMessage", () => {
  const allCodes: ErrorCode[] = [
    "VALIDATION_ERROR",
    "NOT_FOUND",
    "UNAUTHORIZED",
    "FORBIDDEN",
    "EXTERNAL_SERVICE_ERROR",
    "PROCESSING_ERROR",
  ];

  it.each(allCodes)("returns a default message for %s", (code) => {
    const error: ActionError = { code, message: "server detail" };
    const result = getUserErrorMessage(error);

    expect(result.title).toBeTruthy();
    expect(result.description).toBeTruthy();
    // Should NOT expose the raw server message
    expect(result.title).not.toBe("server detail");
  });

  it("returns specific messages for each code", () => {
    expect(getUserErrorMessage({ code: "VALIDATION_ERROR", message: "" }).title).toBe(
      "Invalid input",
    );
    expect(getUserErrorMessage({ code: "NOT_FOUND", message: "" }).title).toBe("Not found");
    expect(getUserErrorMessage({ code: "UNAUTHORIZED", message: "" }).title).toBe(
      "Sign in required",
    );
    expect(getUserErrorMessage({ code: "FORBIDDEN", message: "" }).title).toBe("Access denied");
    expect(
      getUserErrorMessage({ code: "EXTERNAL_SERVICE_ERROR", message: "" }).title,
    ).toBe("Connection problem");
    expect(getUserErrorMessage({ code: "PROCESSING_ERROR", message: "" }).title).toBe(
      "Processing failed",
    );
  });

  it("uses override message as title when provided", () => {
    const error: ActionError = { code: "PROCESSING_ERROR", message: "internal" };
    const result = getUserErrorMessage(error, "Custom title");

    expect(result.title).toBe("Custom title");
    expect(result.description).toBe(
      "We couldn't process your request. Please try again.",
    );
  });

  it("preserves default description even with override message", () => {
    const error: ActionError = { code: "UNAUTHORIZED", message: "" };
    const result = getUserErrorMessage(error, "Please log in");

    expect(result.title).toBe("Please log in");
    expect(result.description).toBe(
      "Your session may have expired. Please sign in again.",
    );
  });

  it("does not include action by default", () => {
    const error: ActionError = { code: "PROCESSING_ERROR", message: "" };
    const result = getUserErrorMessage(error);

    expect(result.action).toBeUndefined();
  });
});
