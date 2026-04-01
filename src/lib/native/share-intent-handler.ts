import { isNative } from '@/lib/platform';
import GpxReceive from './gpx-receive';
import type { GpxFileReceivedEvent } from './gpx-receive';

const SHARE_CACHE = 'bosco-share-target';
const SHARE_KEY = '/shared-gpx';

// Prevent duplicate processing: the native plugin may fire the retained event
// AND checkIntent() may return the same data on cold start.
let processing = false;

async function handleGpxReceived(data: GpxFileReceivedEvent) {
  if (processing) return;
  processing = true;

  try {
    const response = new Response(data.content, {
      headers: { 'Content-Type': 'application/gpx+xml' },
    });
    const cache = await caches.open(SHARE_CACHE);
    await cache.put(SHARE_KEY, response);
    window.location.href = '/share-target?shared=1';
  } catch {
    processing = false;
  }
}

export function initShareIntentListener() {
  if (!isNative) return;

  // Listen for warm-start intents
  GpxReceive.addListener('gpxFileReceived', handleGpxReceived);

  // Check for cold-start intent (fallback if retained event missed)
  GpxReceive.checkIntent().then((result) => {
    if (result?.content) {
      handleGpxReceived(result);
    }
  });
}
