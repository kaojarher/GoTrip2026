// 厚片旅行社 Service Worker：程式殼層可離線開啟；地圖圖磚與 API 一律走網路（不快取）
const CACHE='gotrip-shell-v1';
const LIBS=/^https:\/\/(cdn\.jsdelivr\.net|unpkg\.com)\//;
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(['./','manifest.webmanifest','icon-192.png','icon-512.png']).catch(()=>{})))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('gotrip-shell-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  if(r.mode==='navigate'){ // 網頁本體：網路優先，離線時用快取
    e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp));return res}).catch(()=>caches.match(r).then(m=>m||caches.match('./'))));
    return;
  }
  if(u.origin===location.origin||LIBS.test(r.url)){ // 同網站檔案與 CDN 函式庫：先給快取、背景更新
    e.respondWith(caches.match(r).then(hit=>{
      const net=fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque')){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp))}return res}).catch(()=>hit);
      return hit||net;
    }));
  }
});
