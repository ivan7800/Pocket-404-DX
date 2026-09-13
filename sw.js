const CACHE='pocket-404-dx-v6.1.0-final-balance';
const ASSETS=[
  './','./index.html','./css/app.css?v=6.1.0','./js/bundle.js?v=6.1.0','./manifest.webmanifest?v=6.1.0',
  './assets/icons/icon.svg','./assets/icons/icon-192.png','./assets/icons/icon-512.png'
];
async function fresh(url){const r=await fetch(new Request(url,{cache:'reload'}));if(!r.ok)throw new Error(`${r.status} ${url}`);return r;}
self.addEventListener('install',e=>e.waitUntil((async()=>{const c=await caches.open(CACHE);for(const a of ASSETS)c.put(a,await fresh(a));await self.skipWaiting();})()));
self.addEventListener('activate',e=>e.waitUntil((async()=>{const ks=await caches.keys();await Promise.all(ks.filter(k=>(k.startsWith('pocket-404-dx-')&&k!==CACHE)||k.startsWith('pocket-404-classic-')).map(k=>caches.delete(k)));await self.clients.claim();})()));
self.addEventListener('message',e=>{if(e.data?.type==='SKIP_WAITING')self.skipWaiting();});
async function networkFirst(request){const c=await caches.open(CACHE);try{const r=await fetch(new Request(request,{cache:'no-store'}));if(r&&r.ok)await c.put(request,r.clone());return r;}catch(err){const cached=await caches.match(request);if(cached)return cached;if(request.mode==='navigate')return caches.match('./index.html');throw err;}}
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(networkFirst(e.request));});
