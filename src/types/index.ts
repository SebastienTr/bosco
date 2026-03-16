/**
 * Shared application types.
 * Generated Supabase types will be added in src/types/supabase.ts after first migration.
 */

/** Standard Server Action response format */
export type ActionResponse<T> =
  | { data: T; error: null }
  | { data: null; error: ActionError };

export type ActionError = {
  code: ErrorCode;
  message: string;
};

export type ErrorCode =
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "EXTERNAL_SERVICE_ERROR"
  | "PROCESSING_ERROR";
