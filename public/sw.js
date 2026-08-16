const CACHE_NAME = "p2kd-kalisalak-v1";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Pass through all live API requests and database requests directly without caching
  if (
    event.request.url.includes("/api/") ||
    event.request.method !== "GET"
  ) {
    return;
  }

  // Network-first strategy for smooth updates
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
