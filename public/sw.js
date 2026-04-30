/**
 * SkoolarPlay Service Worker
 * Provides offline support, caching, and background sync
 */

const CACHE_NAME = 'skoolarplay-v1';
const STATIC_CACHE = 'skoolarplay-static-v1';
const DYNAMIC_CACHE = 'skoolarplay-dynamic-v1';

// Static assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/logo.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// API routes to cache
const CACHEABLE_API_ROUTES = [
  '/api/courses',
  '/api/dashboard',
  '/api/achievements',
];

// Cache first, then network strategy
const CACHE_FIRST_ROUTES = [
  '/_next/static',
  '/icons',
  '/images',
];

// Network first, fallback to cache - but ONLY for public routes (no auth required)
const NETWORK_FIRST_ROUTES = [
  '/api/courses',
  '/api/achievements',
  '/api/announcements',
  '/api/leaderboard',
];

self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Caching static assets');
      // Add each asset individually to prevent total failure if one fails
      return Promise.allSettled(
        STATIC_ASSETS.map((asset) =>
          fetch(asset, { mode: 'cors' })
            .then((response) => {
              if (response.ok) {
                return cache.put(asset, response);
              }
            })
            .catch(() => {
              console.log('[SW] Failed to cache:', asset);
            })
        )
      );
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map((key) => {
            console.log('[SW] Removing old cache:', key);
            return caches.delete(key);
          })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) return;

  // Handle static assets - cache first
  if (CACHE_FIRST_ROUTES.some((route) => url.pathname.startsWith(route))) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Handle API routes - network first with cache fallback
  // BUT: Never cache authenticated routes to prevent 401 errors
  if (NETWORK_FIRST_ROUTES.some((route) => url.pathname.startsWith(route))) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Authenticated API routes - network only, no caching
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkOnly(request));
    return;
  }

  // Handle page navigations - network first
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }

  // Default - stale while revalidate
  event.respondWith(staleWhileRevalidate(request));
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.log('[SW] Cache first fetch failed:', error);
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) {
      console.log('[SW] Serving from cache:', request.url);
      return cached;
    }
    return new Response('Offline - No cached data available', { status: 503 });
  }
}

async function staleWhileRevalidate(request) {
  const cached = await caches.match(request);
  
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      caches.open(DYNAMIC_CACHE).then((cache) => {
        cache.put(request, response.clone());
      });
    }
    return response;
  }).catch(() => null);

  return cached || fetchPromise || new Response('Offline', { status: 503 });
}

// Network only - no caching for authenticated routes
async function networkOnly(request) {
  try {
    const response = await fetch(request);
    return response;
  } catch (error) {
    return new Response('Network error', { status: 503 });
  }
}

// Background sync for offline mutations
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'sync-lesson-progress') {
    event.waitUntil(syncLessonProgress());
  }
  
  if (event.tag === 'sync-gems') {
    event.waitUntil(syncGems());
  }
});

async function syncLessonProgress() {
  try {
    const pendingProgress = await getFromIndexedDB('pendingProgress');
    if (!pendingProgress || pendingProgress.length === 0) return;

    for (const progress of pendingProgress) {
      try {
        await fetch('/api/lessons/' + progress.lessonId + '/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(progress),
        });
        await removeFromIndexedDB('pendingProgress', progress.id);
      } catch (error) {
        console.log('[SW] Failed to sync progress:', error);
      }
    }
  } catch (error) {
    console.log('[SW] Sync lesson progress failed:', error);
  }
}

async function syncGems() {
  try {
    const pendingGems = await getFromIndexedDB('pendingGems');
    if (!pendingGems || pendingGems.length === 0) return;

    for (const gift of pendingGems) {
      try {
        await fetch('/api/gems/gift', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(gift),
        });
        await removeFromIndexedDB('pendingGems', gift.id);
      } catch (error) {
        console.log('[SW] Failed to sync gem gift:', error);
      }
    }
  } catch (error) {
    console.log('[SW] Sync gems failed:', error);
  }
}

// IndexedDB helpers
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('skoolarplay-offline', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pendingProgress')) {
        db.createObjectStore('pendingProgress', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('pendingGems')) {
        db.createObjectStore('pendingGems', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

async function getFromIndexedDB(storeName) {
  const db = await openIndexedDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

async function removeFromIndexedDB(storeName, id) {
  const db = await openIndexedDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.delete(id);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// Push notification handling
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.message || 'You have a new notification',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-512.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
    },
    actions: data.actions || [],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'SkoolarPlay', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});

// Message handling from main app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CACHE_COURSES') {
    cacheCourses();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    clearAllCaches();
  }
});

async function cacheCourses() {
  try {
    const response = await fetch('/api/courses?limit=50');
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put('/api/courses', response.clone());
      console.log('[SW] Courses cached successfully');
    }
  } catch (error) {
    console.log('[SW] Failed to cache courses:', error);
  }
}

async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(cacheNames.map((name) => caches.delete(name)));
  console.log('[SW] All caches cleared');
}
