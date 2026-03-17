// Minimal service worker for PWA installability + Web Share Target
// No caching, no offline support — purely for share target interception

const SHARE_CACHE = "bosco-share-target";

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Only intercept the share target POST
  if (url.pathname === "/share-target" && event.request.method === "POST") {
    event.respondWith(handleShareTarget(event.request));
  }
  // All other requests pass through to the network — do not interfere
});

async function handleShareTarget(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("gpx");

    if (file) {
      const cache = await caches.open(SHARE_CACHE);
      // Store the file as a Response in Cache API
      await cache.put("shared-gpx", new Response(file));
    }
  } catch (e) {
    // If file extraction fails, still redirect — the page will handle the error
    console.error("[SW] Share target file extraction failed:", e);
  }

  // Redirect to share-target page (GET) with marker param
  return Response.redirect(
    new URL("/share-target?shared=1", self.location.origin),
    303,
  );
}

// Install: activate immediately
self.addEventListener("install", () => {
  self.skipWaiting();
});

// Activate: claim all clients
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});
