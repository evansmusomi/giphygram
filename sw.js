// SW version
const version = "1.1";

// Static cache - App shell
const appAssets = [
  "index.html",
  "style.css",
  "main.js",
  "images/flame.png",
  "images/logo.png",
  "images/sync.png",
  "vendor/bootstrap.min.css",
  "vendor/jquery.min.js"
];

// SW install
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(`static-${version}`).then(cache => cache.addAll(appAssets))
  );
});

// SW activate
self.addEventListener("activate", e => {
  let cleaned = caches.keys().then(keys => {
    keys.forEach(key => {
      if (key !== `static-${version}` && key.match("static-")) {
        return caches.delete(key);
      }
    });
  });
  e.waitUntil(cleaned);
});

// Static cache strategy - Cache with network fallback
const staticCache = request => {
  return caches.match(request).then(cachedResponse => {
    if (cachedResponse) return cachedResponse;

    return fetch(request).then(networkResponse => {
      caches
        .open(`static-${version}`)
        .then(cache => cache.put(request, networkResponse));
      return networkResponse.clone();
    });
  });
};

// SW fetch
self.addEventListener("fetch", e => {
  // Use cache with network fallback strategy for App Shell
  if (e.request.url.match(location.origin)) {
    e.respondWith(staticCache(e.request));
  }
});
