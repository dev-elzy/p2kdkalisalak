const CACHE_NAME = "p2kd-kalisalak-v3";
const PRECACHE_ASSETS = [
  "/icon-192x192.png",
  "/icon-512x512.png",
  "/apple-touch-icon.png",
  "/logo.svg",
  "/manifest.json",
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn("Precache skipped for some assets:", err);
      });
    })
  );
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

  // Cache-first strategy for icons and static assets to ensure instant PWA loading
  if (
    event.request.url.includes(".png") ||
    event.request.url.includes(".svg") ||
    event.request.url.includes("/manifest.json")
  ) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return cached || fetch(event.request);
      })
    );
    return;
  }

  // Network-first strategy for live HTML and JS pages
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
