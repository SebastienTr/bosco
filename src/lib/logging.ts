import * as Sentry from "@sentry/nextjs";
import type { ActionResponse } from "@/types";

const REDACTED_FIELDS = /^(password|secret|token|file|fileContent|authorization)$/i;
const MAX_FIELD_LENGTH = 200;
const MAX_FIELDS = 5;

export function summarizeInput(input: unknown): Record<string, string> {
  if (!input || typeof input !== "object") return {};

  // Handle FormData by converting to plain object
  if (typeof FormData !== "undefined" && input instanceof FormData) {
    const obj: Record<string, unknown> = {};
    input.forEach((value, key) => {
      if (value instanceof File) {
        obj[key] = `[File: ${value.name}, ${value.size}b]`;
      } else {
        obj[key] = value;
      }
    });
    return summarizeInput(obj);
  }

  const entries = Object.entries(input as Record<string, unknown>);
  const result: Record<string, string> = {};
  let count = 0;

  for (const [key, value] of entries) {
    if (count >= MAX_FIELDS) break;

    if (REDACTED_FIELDS.test(key)) {
      result[key] = "[REDACTED]";
    } else if (typeof value === "string") {
      result[key] =
        value.length > MAX_FIELD_LENGTH
          ? value.slice(0, MAX_FIELD_LENGTH) + "..."
          : value;
    } else if (value !== null && value !== undefined) {
      const str = String(value);
      result[key] =
        str.length > MAX_FIELD_LENGTH
          ? str.slice(0, MAX_FIELD_LENGTH) + "..."
          : str;
    }

    count++;
  }

  return result;
}

export function logAction(
  actionName: string,
  userId: string | null,
  input: unknown,
  result: "success" | "error",
  durationMs: number,
  errorCode?: string,
): void {
  const entry = JSON.stringify({
    action: actionName,
    userId,
    input: summarizeInput(input),
    result,
    durationMs: Math.round(durationMs),
    ...(errorCode && { errorCode }),
    timestamp: new Date().toISOString(),
  });

  if (result === "error") {
    console.error(entry);
  } else {
    console.info(entry);
  }
}

export function withLogging<TInput, TOutput>(
  actionName: string,
  fn: (input: TInput) => Promise<ActionResponse<TOutput>>,
): (input: TInput) => Promise<ActionResponse<TOutput>> {
  return async (input: TInput) => {
    const start = performance.now();
    try {
      const result = await fn(input);
      const duration = performance.now() - start;
      const isError = result.error !== null;
      logAction(
        actionName,
        null,
        input,
        isError ? "error" : "success",
        duration,
        isError ? result.error.code : undefined,
      );
      return result;
    } catch (err) {
      const duration = performance.now() - start;
      Sentry.captureException(err, {
        extra: { actionName, input: summarizeInput(input) },
      });
      logAction(actionName, null, input, "error", duration, "PROCESSING_ERROR");
      return {
        data: null,
        error: {
          code: "PROCESSING_ERROR" as const,
          message: "An unexpected error occurred",
        },
      };
    }
  };
}
