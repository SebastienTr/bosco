import type { ActionError, ErrorCode } from "@/types";

export interface ErrorDisplay {
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

const ERROR_MESSAGES: Record<ErrorCode, { title: string; description: string }> = {
  VALIDATION_ERROR: {
    title: "Invalid input",
    description: "Please check the form fields and try again.",
  },
  NOT_FOUND: {
    title: "Not found",
    description: "This item may have been deleted or moved.",
  },
  UNAUTHORIZED: {
    title: "Sign in required",
    description: "Your session may have expired. Please sign in again.",
  },
  FORBIDDEN: {
    title: "Access denied",
    description: "You don't have permission to perform this action.",
  },
  EXTERNAL_SERVICE_ERROR: {
    title: "Connection problem",
    description: "Something went wrong on our end. Please try again.",
  },
  PROCESSING_ERROR: {
    title: "Processing failed",
    description: "We couldn't process your request. Please try again.",
  },
};

export function getUserErrorMessage(
  error: ActionError,
  overrideMessage?: string,
): ErrorDisplay {
  const defaults = ERROR_MESSAGES[error.code] ?? ERROR_MESSAGES.PROCESSING_ERROR;

  return {
    title: overrideMessage ?? defaults.title,
    description: defaults.description,
  };
}
