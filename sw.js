const CACHE = 'snops-8f4aac4e41d5';
const FONTS = 'snops-fonts';
const FILES = [
  "cards/CA.jpg",
  "cards/CJ.jpg",
  "cards/CK.jpg",
  "cards/CQ.jpg",
  "cards/CT.jpg",
  "cards/DA.jpg",
  "cards/DJ.jpg",
  "cards/DK.jpg",
  "cards/DQ.jpg",
  "cards/DT.jpg",
  "cards/HA.jpg",
  "cards/HJ.jpg",
  "cards/HK.jpg",
  "cards/HQ.jpg",
  "cards/HT.jpg",
  "cards/SA.jpg",
  "cards/SJ.jpg",
  "cards/SK.jpg",
  "cards/SQ.jpg",
  "cards/ST.jpg",
  "cards/back.jpg",
  "icon-180.png",
  "icon-192.png",
  "icon-512.png",
  "index.html",
  "manifest.webmanifest"
];

self.addEventListener('install', e => {
  // 'reload' skips the browser's HTTP cache, which could otherwise hand back the previous version.
  const fresh = FILES.map(f => new Request(f, { cache: 'reload' }));
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(fresh)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE && k !== FONTS).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(caches.open(FONTS).then(c => c.match(e.request).then(hit => hit ||
      fetch(e.request).then(res => { c.put(e.request, res.clone()); return res; }))));
    return;
  }
  if (url.origin !== location.origin) return;
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request.url, { cache: 'no-cache' }).then(res => {
      if (res.ok) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put('index.html', copy));
      }
      return res;
    }).catch(() => caches.match('index.html')));
    return;
  }
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request)));
});
