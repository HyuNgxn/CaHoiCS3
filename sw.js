/* Service worker — network-first cho HTML (luôn lấy bản mới khi online),
   cache-first cho ảnh/tĩnh. Tự dọn cache cũ. */
const CACHE = 'xepca-ver-2.0-release-1';
const ASSETS = [
  './',
  'index.html',
  'ui.css',
  'iphone.css',
  'minimal.css',
  'ui.css?v=27',
  'iphone.css?v=27',
  'minimal.css?v=27',
  'ui.js?v=200',
  'soft.css?v=200',
  'snapshot.js?v=201',
  'publishing.js?v=204',
  'cloud-config.js?v=202',
  'history.js?v=28',
  'ui.js',
  'manifest.webmanifest',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/apple-touch-icon.png'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('xepca-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', e => {
  const req = e.request;
  const url=new URL(req.url);
  const scope=new URL(self.registration.scope);
  const relative=url.pathname.startsWith(scope.pathname)?url.pathname.slice(scope.pathname.length):null;
  // Never cache private employee responses or replace the employee page with manager HTML.
  if(url.origin!==self.location.origin||relative===null||relative.startsWith('api/')||relative.startsWith('employee'))return;
  if (req.method !== 'GET') return;
  const isHTML = req.mode === 'navigate' ||
    (req.headers.get('accept') || '').includes('text/html');
  if (isHTML) {
    if(relative!==''&&relative!=='index.html')return;
    // network-first: ưu tiên bản mới, offline thì dùng cache
    e.respondWith(
      fetch(req).then(res => {
        if(!res.ok||!res.headers.get('content-type')?.includes('text/html'))return res;
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put('index.html', copy)).catch(() => {});
        return res;
      }).catch(() => caches.match(req).then(h => h || caches.match('index.html')))
    );
    return;
  }
  // static: cache-first, cập nhật ngầm
  if(!ASSETS.some(asset=>new URL(asset,scope).href===url.href))return;
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      if(!res.ok)return res;
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
      return res;
    }))
  );
});
