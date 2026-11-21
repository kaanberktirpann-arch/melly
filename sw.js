// Melly - çevrimdışı çalışma için önbellek. Bilgi göndermez; yalnızca uygulama dosyalarını saklar.
// Yeni sürüm yayınlanınca SURUM değerini artırın.
const SURUM = "melly-0.8";
const DOSYALAR = ["./", "./index.html", "./manifest.webmanifest", "./icon-180.png", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(SURUM).then(c => c.addAll(DOSYALAR)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== SURUM).map(x => caches.delete(x)))).then(() => self.clients.claim()));
});

// Önce internetten en yeni sürümü dene, internet yoksa önbellekteki sürümü aç.
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    fetch(e.request).then(r => {
      const kopya = r.clone();
      caches.open(SURUM).then(c => c.put(e.request, kopya));
      return r;
    }).catch(() => caches.match(e.request).then(r => r || caches.match("./index.html")))
  );
});
