/* The build you are running changes when you ask it to, and not before.
   The page is served from a cache of its own, SHELL, which nothing replaces
   on its own. Installing a new worker fills the versioned asset cache and
   leaves SHELL alone; activating purges old asset caches and leaves SHELL
   alone. Only the in-app Update button clears the caches and reloads. */
const VERSION = "1.1.6";
const ASSETS = "assetmgr-" + VERSION;   /* icons, manifest — versioned, purged */
const SHELL = "assetmgr-shell";         /* the page itself — replaced only on request */

function freshPage(){
  return fetch(new Request("./index.html", { cache: "reload" }));
}

const ASSET_URLS = [
  "./manifest.webmanifest",
  "./RELEASES.md",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./icons/apple-touch-icon.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(ASSETS)
      .then((cache) => cache.addAll(ASSET_URLS))
      .then(() => caches.open(SHELL))
      .then((shell) => shell.match("./index.html").then((hit) =>
        hit ? null : freshPage().then((res) =>
          res && res.ok ? shell.put("./index.html", res) : null)))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== ASSETS && k !== SHELL).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  if (new URL(req.url).origin !== location.origin) return;

  const isDocument = req.mode === "navigate" || req.destination === "document";

  if (isDocument) {
    event.respondWith(
      caches.open(SHELL).then((shell) =>
        shell.match("./index.html").then((hit) => {
          if (hit) return hit;
          return freshPage()
            .then((res) => {
              if (res && res.ok) shell.put("./index.html", res.clone());
              return res;
            })
            .catch(() => caches.match(req).then((c) => c || caches.match("./index.html")));
        })
      )
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(ASSETS).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
