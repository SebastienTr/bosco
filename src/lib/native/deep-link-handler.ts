import { isNative } from "@/lib/platform";
import { App } from "@capacitor/app";

// Prevent duplicate navigation: on cold start, both getLaunchUrl() and
// the retained appUrlOpen event can deliver the same URL.
// For auth confirm codes, a second navigation would fail (code already consumed).
let lastHandledUrl: string | null = null;

function handleAppUrl(url: string) {
  if (url === lastHandledUrl) return;

  try {
    const parsed = new URL(url);
    const target = parsed.pathname + parsed.search + parsed.hash;
    if (
      target &&
      target !==
        window.location.pathname +
          window.location.search +
          window.location.hash
    ) {
      lastHandledUrl = url;
      window.location.href = target;
    }
  } catch {
    // Invalid URL — ignore silently
  }
}

export function initDeepLinkListener() {
  if (!isNative) return;

  // Warm start: app already running, user taps an external link
  App.addListener("appUrlOpen", (event) => {
    handleAppUrl(event.url);
  });

  // Cold start: app launched via deep link
  App.getLaunchUrl().then((result) => {
    if (result?.url) {
      handleAppUrl(result.url);
    }
  });
}
