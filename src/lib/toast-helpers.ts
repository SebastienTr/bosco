import { toast } from "sonner";
import type { ActionError } from "@/types";
import { getUserErrorMessage } from "@/lib/errors";

interface ShowActionErrorOptions {
  /** Override default message derived from error code */
  message?: string;
  /** Override default description */
  description?: string;
  /** Retry callback — shows "Retry" action button */
  onRetry?: () => void;
}

export function showActionError(
  error: ActionError,
  options?: ShowActionErrorOptions,
) {
  const defaults = getUserErrorMessage(error);
  const title = options?.message ?? defaults.title;
  const description = options?.description ?? defaults.description;

  toast.error(title, {
    description,
    duration: Infinity,
    action: options?.onRetry
      ? { label: "Retry", onClick: options.onRetry }
      : undefined,
  });
}
