"use client";

import { useCallback, useState } from "react";
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
  ogImageUrl?: string;
  className?: string;
}

async function fetchOgImageAsFile(
  ogImageUrl: string,
): Promise<File | null> {
  try {
    const response = await fetch(ogImageUrl);
    if (!response.ok) return null;
    const blob = await response.blob();
    return new File([blob], "voyage.png", { type: blob.type || "image/png" });
  } catch {
    return null;
  }
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
  ogImageUrl,
  className = "",
}: ShareButtonProps) {
  const [loading, setLoading] = useState(false);

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success(messages.copied);
    } catch {
      toast.error(messages.copyFailed);
    }
  }, [url, messages.copied, messages.copyFailed]);

  const handleShare = useCallback(async () => {
    setLoading(true);
    try {
    const isMobile = isLikelyMobileDevice();
    const hasNativeShare =
      typeof navigator !== "undefined" &&
      typeof navigator.share === "function" &&
      isMobile;

    if (!hasNativeShare) {
      await copyToClipboard();
      return;
    }

    // Try sharing with OG image first (enables Instagram Stories, etc.)
    if (ogImageUrl) {
      const file = await fetchOgImageAsFile(ogImageUrl);
      if (file) {
        const fileShareData = { files: [file], title, url };
        if (
          typeof navigator.canShare === "function" &&
          navigator.canShare(fileShareData)
        ) {
          try {
            await navigator.share(fileShareData);
            return;
          } catch (err: unknown) {
            const isAbort =
              err instanceof DOMException && err.name === "AbortError";
            if (isAbort) return;
            // Fall through to text-only share
          }
        }
      }
    }

    // Fallback: text-only share
    const textShareData = { title, text, url };
    try {
      await navigator.share(textShareData);
    } catch (err: unknown) {
      const isAbort =
        err instanceof DOMException && err.name === "AbortError";
      if (!isAbort) {
        await copyToClipboard();
      }
    }
    } finally {
      setLoading(false);
    }
  }, [title, text, url, ogImageUrl, copyToClipboard]);

  return (
    <button
      type="button"
      onClick={handleShare}
      disabled={loading}
      aria-label={messages.label}
      className={`flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-navy/80 text-white shadow-overlay backdrop-blur-[12px] transition-all active:scale-95 hover:bg-navy/90 focus-visible:outline-2 focus-visible:outline-ocean focus-visible:outline-offset-2 disabled:pointer-events-none ${className}`}
    >
      {loading ? (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="animate-spin"
        >
          <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
          <path d="M12 2a10 10 0 0 1 10 10" />
        </svg>
      ) : (
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
      )}
    </button>
  );
}
