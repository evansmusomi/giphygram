// SW version
const version = "1.2";

// Static cache - App shell
const appAssets = [
  "index.html",
  "style.css",
  "main.js",
  "images/flame.png",
  "images/logo.png",
  "images/sync.png",
  "images/placeholder.gif",
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

// Cache with network fallback strategy
const staticCache = (request, cacheName = `static-${version}`) => {
  return caches.match(request).then(cachedResponse => {
    if (cachedResponse) return cachedResponse;

    return fetch(request)
      .then(networkResponse => {
        caches
          .open(cacheName)
          .then(cache => cache.put(request, networkResponse));
        return networkResponse.clone();
      })
      .catch(err => {
        if (request.url.match("giphy.com/media")) {
          return caches.match("images/placeholder.gif");
        }
        console.log(error);
      });
  });
};

// Network with cache fallback strategy
const fallbackCache = request => {
  return fetch(request)
    .then(networkResponse => {
      if (!networkResponse.ok) throw "Fetch Error";

      caches
        .open(`static-${version}`)
        .then(cache => cache.put(request, networkResponse));

      return networkResponse.clone();
    })
    .catch(err => caches.match(request));
};

// Clean old giphys from the 'giphy' cache
const cleanGiphyCache = giphys => {
  caches.open("giphy").then(cache => {
    cache.keys().then(keys => {
      // Loop through cache entries (requests)
      keys.forEach(key => {
        // If entry is NOT part of current Giphys, Delete
        if (!giphys.includes(key.url)) cache.delete(key);
      });
    });
  });
};

// SW fetch
self.addEventListener("fetch", e => {
  // App shell
  if (e.request.url.match(location.origin)) {
    e.respondWith(staticCache(e.request));

    // Giphy API
  } else if (e.request.url.match("api.giphy.com/v1/gifs/search")) {
    e.respondWith(fallbackCache(e.request));

    // Giphy Media
  } else if (e.request.url.match("giphy.com/media")) {
    e.respondWith(staticCache(e.request, "giphy"));
  }
});

// Listen for message from client
self.addEventListener("message", e => {
  // Identify the message
  if (e.data.action === "cleanGiphyCache") cleanGiphyCache(e.data.giphys);
});
