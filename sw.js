const CACHE='voyana-v3-0';
const ASSETS=[
  './','./index.html','./manifest.webmanifest',
  './css/main.css','./js/app.js','./js/api.js','./js/data.js',
  './js/i18n.js','./js/render.js','./js/utils.js'
];
self.addEventListener('install',event=>{
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)));
});
self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key))))
      .then(()=>self.clients.claim())
  );
});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;
  event.respondWith(fetch(event.request).catch(()=>caches.match(event.request)));
});
