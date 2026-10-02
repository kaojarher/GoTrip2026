// [PWA 修訂] 快取版本號：每次更新檔案請遞增，舊快取會自動清除
const CACHE = 'gotrip2026v2';
const ASSETS = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
// [PWA 新增] 預先快取 globe.gl 函式庫，讓離線時 App 仍可開啟
const CDN = ['https://cdn.jsdelivr.net/npm/globe.gl@2/dist/globe.gl.min.js'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(async c => {
    await c.addAll(ASSETS);
    // [PWA 新增] CDN 失敗不影響安裝
    await Promise.all(CDN.map(u => fetch(u).then(r => r.ok && c.put(u, r)).catch(() => {})));
  }));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  // [PWA 修訂] 只處理 GET；僅快取成功回應，避免快取錯誤頁
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => {
    if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
    return res;
  }).catch(() => r || caches.match('./index.html'))));
});
