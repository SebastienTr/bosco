"use client";

import { useCallback } from "react";
import { toast } from "sonner";

export interface ShareButtonMessages {
  label: string;
  copied: string;
  copyFailed: string;
}

interface ShareButtonProps {
  url: string;
  title: string;
  text: string;
  messages: ShareButtonMessages;
  className?: string;
}

type NavigatorWithUserAgentData = Navigator & {
  userAgentData?: {
    mobile?: boolean;
  };
};

function isLikelyMobileDevice() {
  if (typeof navigator === "undefined") {
    return false;
  }

  const nav = navigator as NavigatorWithUserAgentData;
  if (typeof nav.userAgentData?.mobile === "boolean") {
    return nav.userAgentData.mobile;
  }

  const userAgent = nav.userAgent;
  if (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(
      userAgent,
    )
  ) {
    return true;
  }

  return userAgent.includes("Macintosh") && nav.maxTouchPoints > 1;
}

export function ShareButton({
  url,
  title,
  text,
  messages,
  className = "",
}: ShareButtonProps) {
  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success(messages.copied);
    } catch {
      toast.error(messages.copyFailed);
    }
  }, [url, messages.copied, messages.copyFailed]);

  const handleShare = useCallback(async () => {
    const shareData = { title, text, url };
    const canUseNativeShare =
      typeof navigator !== "undefined" &&
      typeof navigator.share === "function" &&
      isLikelyMobileDevice() &&
      (typeof navigator.canShare !== "function" ||
        navigator.canShare(shareData));

    if (canUseNativeShare) {
      try {
        await navigator.share(shareData);
      } catch (err: unknown) {
        // User cancelled the share sheet — not an error
        const isAbort =
          err instanceof DOMException && err.name === "AbortError";
        if (!isAbort) {
          await copyToClipboard();
        }
      }
    } else {
      await copyToClipboard();
    }
  }, [title, text, url, copyToClipboard]);

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label={messages.label}
      className={`flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-navy/60 text-white shadow-overlay backdrop-blur-[12px] transition-transform active:scale-95 focus-visible:outline-2 focus-visible:outline-ocean focus-visible:outline-offset-2 ${className}`}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
        <polyline points="16 6 12 2 8 6" />
        <line x1="12" y1="2" x2="12" y2="15" />
      </svg>
    </button>
  );
}
