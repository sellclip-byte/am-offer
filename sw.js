const CACHE='amoffer-shell-v2136';
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(['/','/index.html','/site.webmanifest','/google-icon-192x192.png','/google-icon-512x512.png']).catch(()=>{})))});
self.addEventListener('activate',e=>{e.waitUntil(self.clients.claim())});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(fetch(e.request).catch(()=>caches.match(e.request).then(r=>r||caches.match('/index.html'))))});
