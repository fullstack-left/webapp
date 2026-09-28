// AvtoSmart immutable offline shell.
// IMPORTANT: bump CACHE_VERSION for every deployed shell/catalog release.
const CACHE_VERSION = "avtosmart-shell-2026.09.2";
const APP_SHELL = [
  "./",
  "./index.html",
  "./offline.html",
  "./manifest.webmanifest",
  "./manifest.cy.webmanifest",
  "./manifest.ru.webmanifest",
  "./css/styles.css",
  "./js/app.js",
  "./js/catalog.js",
  "./js/exam.js",
  "./js/i18n.js",
  "./js/storage.js",
  "./js/pwa.js",
  "./data/topics.js",
  "./data/questions.js",
  "./icons/icon.svg",
  "./icons/maskable.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(request.mode === "navigate"
    ? immutableNavigationResponse(request)
    : immutableAssetResponse(request));
});

async function immutableNavigationResponse(request) {
  const cache = await caches.open(CACHE_VERSION);
  // A controlling worker always serves the index from its own release cache.
  // New files are staged only by the next worker under a new CACHE_VERSION.
  const cached = await cache.match("./index.html");
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) await cache.put("./index.html", response.clone());
    return response;
  } catch {
    return (await cache.match("./offline.html")) || Response.error();
  }
}

async function immutableAssetResponse(request) {
  const cache = await caches.open(CACHE_VERSION);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    // Cache only misses; never overwrite an asset in the active release.
    if (response.ok && response.type === "basic") await cache.put(request, response.clone());
    return response;
  } catch {
    return Response.error();
  }
}
