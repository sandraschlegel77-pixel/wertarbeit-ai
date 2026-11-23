/* AtelierPilot Monitor – schlanker Service Worker.
 * Cacht nur statische Dateien (Icons/Manifest). Seiten mit Verdienstdaten werden bewusst NICHT
 * zwischengespeichert (geteilte Geräte). Offline zeigt eine Hinweisseite. */
const CACHE = "atelierpilot-monitor-v1";
const STATIC = ["/manifest.json", "/icon-192.png", "/icon-512.png", "/icon-maskable-512.png"];

const OFFLINE_HTML = `<!doctype html><html lang="de"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>Offline</title>
<style>body{margin:0;font-family:system-ui,sans-serif;background:#0F172A;color:#E2E8F0;display:grid;place-items:center;min-height:100vh;text-align:center;padding:24px}
h1{color:#F7E7CE;font-size:20px}p{color:#94A3B8;line-height:1.5}button{background:#D4AF37;color:#0F172A;border:0;border-radius:8px;padding:10px 18px;font-weight:700}</style></head>
<body><main><h1>Keine Verbindung</h1>
<p>Der Kontrollmonitor braucht Internet für Live-Daten.<br>Schnellbefehle, die Sie vorher gespeichert haben, werden automatisch gesendet, sobald Sie wieder online sind.</p>
<button onclick="location.reload()">Erneut versuchen</button></main></body></html>`;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(STATIC)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(
        () =>
          new Response(OFFLINE_HTML, {
            status: 200,
            headers: { "Content-Type": "text/html; charset=utf-8" },
          })
      )
    );
    return;
  }

  if (STATIC.includes(url.pathname)) {
    event.respondWith(caches.match(req).then((hit) => hit || fetch(req)));
  }
});
