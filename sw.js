/* The build you are running changes when you ask it to, and not before.
   The page is served from a cache of its own, SHELL, which nothing replaces
   on its own. Installing a new worker fills the versioned asset cache and
   leaves SHELL alone; activating purges old asset caches and leaves SHELL
   alone. Only the in-app Update button clears the caches and reloads. */
const VERSION = "1.1.36";
const ASSETS = "assetmgr-" + VERSION;   /* icons, manifest — versioned, purged */
const SHELL = "assetmgr-shell";         /* the page itself — replaced only on request */

/* One release, once per device, and never again.

   1.1.28 shipped an unclosed tag that folded every settings pane after GitHub
   sync inside it — including About, which is where the Update button lives.
   The rule that the page changes only when you ask it to is a good rule, but
   it assumes you can still reach the thing that asks. Anyone on that build
   cannot, so this worker lets go of the shell on its own, once, and fetches
   the fixed page.

   Keyed to a cache of its own so it happens a single time per device: a
   later release finding this marker already there leaves the shell alone and
   the usual rule stands. */
const RESCUE = "assetmgr-rescue-1.1.30";

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
    caches.has(RESCUE)
      .then((done) => done ? null
        : caches.delete(SHELL)
            .then(() => caches.open(RESCUE))
            .then((c) => c.put("./rescued", new Response("1.1.30"))))
      .then(() => caches.keys())
      .then((keys) => Promise.all(
        keys.filter((k) => k !== ASSETS && k !== SHELL && k !== RESCUE)
            .map((k) => caches.delete(k))))
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

  const url = new URL(req.url);

  /* Data is asked for fresh. The share prices are rewritten by a workflow
     every weekday, and a cache-first rule would have served the copy taken
     the first time the app ever ran, for ever, while the app believed it was
     refreshing. The cached copy is the fallback for being offline, not the
     answer. */
  if (url.pathname.indexOf("/data/") >= 0) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            /* Stored under the address without its cache-buster, or every
               refresh would leave another copy behind for ever. */
            const key = new Request(url.origin + url.pathname);
            caches.open(ASSETS).then((c) => c.put(key, copy));
          }
          return res;
        })
        .catch(() => caches.match(new Request(url.origin + url.pathname)))
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
