// Lo mínimo para que el móvil la trate como app instalable. Guarda solo esta página y sus iconos;
// la app de verdad (Google Apps Script) siempre se carga de la red.
var CACHE = 'pool-v1';
var BASE = ['./', 'index.html', 'config.js', 'manifest.webmanifest', 'icono-192.png', 'icono-512.png', 'apple-touch-icon.png', 'favicon-32.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(BASE); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
// primero la red (para que los cambios se vean enseguida); sin red, lo guardado
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(function (r) {
    var copia = r.clone(); caches.open(CACHE).then(function (c) { c.put(e.request, copia); }); return r;
  }).catch(function () { return caches.match(e.request); }));
});
