const CACHE_VERSION = 'v2'
const CACHE_NAME = `gestion-hotel-${CACHE_VERSION}`
const STATIC_CACHE = `gestion-hotel-static-${CACHE_VERSION}`
const DYNAMIC_CACHE = `gestion-hotel-dynamic-${CACHE_VERSION}`
const API_CACHE = `gestion-hotel-api-${CACHE_VERSION}`

// URLs à mettre en cache statique
const STATIC_URLS = [
  '/',
  '/auth/login',
  '/auth/register',
  '/manifest.json',
  '/favicon.ico'
]

// Stratégie de cache pour différents types de requêtes
const CACHE_STRATEGIES = {
  // Cache First pour les assets statiques
  static: 'cache-first',
  // Network First pour les API
  api: 'network-first',
  // Stale While Revalidate pour le contenu dynamique
  dynamic: 'stale-while-revalidate'
}

// Installation du service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(cache => cache.addAll(STATIC_URLS)),
      caches.open(DYNAMIC_CACHE),
      caches.open(API_CACHE)
    ])
  )
  self.skipWaiting()
})

// Activation du service worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheName.includes(CACHE_VERSION)) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// Gestion des requêtes fetch
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Ignorer les requêtes non-GET
  if (request.method !== 'GET') return

  // Stratégie pour les API
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request))
    return
  }

  // Stratégie pour les assets statiques
  if (url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|ico|woff|woff2)$/)) {
    event.respondWith(handleStaticRequest(request))
    return
  }

  // Stratégie par défaut (Stale While Revalidate)
  event.respondWith(handleDynamicRequest(request))
})

// Gestion des requêtes API avec background sync
async function handleApiRequest(request) {
  const cache = await caches.open(API_CACHE)
  
  try {
    // Essayer le réseau d'abord
    const networkResponse = await fetch(request)
    
    // Si succès, mettre en cache
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    // Si échec réseau, essayer le cache
    const cachedResponse = await cache.match(request)
    
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Si pas de cache, retourner une réponse offline
    return new Response(
      JSON.stringify({ error: 'Offline', message: 'Pas de connexion internet' }),
      { 
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

// Gestion des assets statiques (Cache First)
async function handleStaticRequest(request) {
  const cache = await caches.open(STATIC_CACHE)
  const cachedResponse = await cache.match(request)
  
  if (cachedResponse) {
    return cachedResponse
  }
  
  try {
    const networkResponse = await fetch(request)
    cache.put(request, networkResponse.clone())
    return networkResponse
  } catch (error) {
    return new Response('Asset non disponible', { status: 404 })
  }
}

// Gestion du contenu dynamique (Stale While Revalidate)
async function handleDynamicRequest(request) {
  const cache = await caches.open(DYNAMIC_CACHE)
  const cachedResponse = await cache.match(request)
  
  // Mettre à jour le cache en arrière-plan
  const fetchPromise = fetch(request).then(networkResponse => {
    cache.put(request, networkResponse.clone())
    return networkResponse
  })
  
  // Retourner le cache si disponible, sinon attendre le réseau
  return cachedResponse || fetchPromise
}

// Background Sync pour les requêtes POST
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-bookings') {
    event.waitUntil(syncBookings())
  }
  if (event.tag === 'sync-reviews') {
    event.waitUntil(syncReviews())
  }
})

// Synchroniser les réservations offline
async function syncBookings() {
  try {
    const cache = await caches.open(API_CACHE)
    const offlineBookings = await cache.match('/offline/bookings')
    
    if (offlineBookings) {
      const bookings = await offlineBookings.json()
      
      for (const booking of bookings) {
        await fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(booking)
        })
      }
      
      await cache.delete('/offline/bookings')
    }
  } catch (error) {
    console.error('Erreur de synchronisation des réservations:', error)
  }
}

// Synchroniser les avis offline
async function syncReviews() {
  try {
    const cache = await caches.open(API_CACHE)
    const offlineReviews = await cache.match('/offline/reviews')
    
    if (offlineReviews) {
      const reviews = await offlineReviews.json()
      
      for (const review of reviews) {
        await fetch('/api/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(review)
        })
      }
      
      await cache.delete('/offline/reviews')
    }
  } catch (error) {
    console.error('Erreur de synchronisation des avis:', error)
  }
}

// Écouter les messages du client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
