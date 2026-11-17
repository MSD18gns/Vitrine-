// Service worker ANDOU DIINEMA — fonctionnement hors ligne et installation PWA
const VERSION = 'ad-v1'
const SHELL = ['/', '/manifest.json', '/logo.svg', '/icons/icon-192.png', '/offline.html']

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()))
})

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()))
})

self.addEventListener('fetch', (e) => {
  const req = e.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  if (url.origin !== self.location.origin && !url.hostname.endsWith('fonts.gstatic.com') && !url.hostname.endsWith('fonts.googleapis.com')) return

  // Navigation : réseau d'abord, puis la page en cache, puis la page hors ligne
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then((res) => { caches.open(VERSION).then((c) => c.put('/', res.clone())); return res })
        .catch(() => caches.match('/').then((r) => r || caches.match('/offline.html'))),
    )
    return
  }
  // Fichiers statiques (versionnés) et polices : cache d'abord
  e.respondWith(
    caches.match(req).then((cached) => cached || fetch(req).then((res) => {
      if (res.ok && (url.pathname.startsWith('/assets/') || url.pathname.startsWith('/icons/') || url.hostname.includes('fonts'))) {
        const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy))
      }
      return res
    })),
  )
})

self.addEventListener('notificationclick', (e) => {
  e.notification.close()
  const target = e.notification.data?.url || '/'
  e.waitUntil(self.clients.matchAll({ type: 'window' }).then((list) => {
    for (const c of list) if ('focus' in c) { c.navigate(target); return c.focus() }
    return self.clients.openWindow(target)
  }))
})
