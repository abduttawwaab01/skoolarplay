/**
 * SkoolarPlay Client-Side Cache Manager
 * Implements "Stay-Free-Forever" strategy to reduce backend costs
 * by aggressively caching data on the client side.
 *
 * Features:
 * - localStorage/IndexedDB backed caching with TTL
 * - Request deduplication (avoid duplicate API calls)
 * - Stale-while-revalidate pattern for smooth UX
 * - Batch sync support for pending mutations
 * - Offline support for cached content
 * - Admin-controlled cache settings
 */

// ===== TYPES =====
interface CacheEntry<T> {
  data: T;
  cachedAt: number;
  ttl: number; // milliseconds
  etag?: string;
}

interface CacheConfig {
  ttlMinutes: number;
  enableOfflineMode: boolean;
  batchSyncInterval: number;
}

const DEFAULT_CONFIG: CacheConfig = {
  ttlMinutes: 30,
  enableOfflineMode: true,
  batchSyncInterval: 5,
};

// ===== IN-MEMORY CACHE (fast access) =====
const memoryCache = new Map<string, CacheEntry<any>>();
const pendingRequests = new Map<string, Promise<any>>();
const pendingMutations: Array<{ key: string; timestamp: number; data: any }> = [];

// ===== TTL BY ENDPOINT =====
const ENDPOINT_TTL: Record<string, number> = {
  // Static/semi-static data - long cache
  '/api/categories': 60 * 60, // 1 hour
  '/api/courses': 30 * 60, // 30 min
  '/api/leaderboard': 5 * 60, // 5 min (more dynamic)
  '/api/quotes': 60 * 60, // 1 hour
  '/api/announcements': 15 * 60, // 15 min
  '/api/quests': 15 * 60, // 15 min
  '/api/daily-challenge': 10 * 60, // 10 min
  '/api/shop/items': 30 * 60, // 30 min

  // User-specific data - shorter cache
  '/api/dashboard': 2 * 60, // 2 min
  '/api/notifications': 1 * 60, // 1 min
  '/api/achievements': 10 * 60, // 10 min

  // Default
  '*': 30 * 60, // 30 min
};

function getTTL(url: string, config: CacheConfig): number {
  // Find matching endpoint
  for (const [endpoint, ttl] of Object.entries(ENDPOINT_TTL)) {
    if (url.includes(endpoint)) {
      return ttl * 1000;
    }
  }
  // Use admin config TTL
  return config.ttlMinutes * 60 * 1000;
}

// ===== KEY GENERATION =====
function getCacheKey(url: string, options?: RequestInit): string {
  const method = options?.method || 'GET';
  const body = options?.body ? `_${typeof options.body === 'string' ? options.body : JSON.stringify(options.body)}` : '';
  return `${method}:${url}${body}`;
}

// ===== STORAGE HELPERS =====
function saveToStorage(key: string, entry: CacheEntry<any>): void {
  try {
    localStorage.setItem(`sp_cache_${key}`, JSON.stringify(entry));
  } catch {
    // localStorage full - clear old entries
    clearOldEntries();
  }
}

function loadFromStorage<T>(key: string): CacheEntry<T> | null {
  try {
    const raw = localStorage.getItem(`sp_cache_${key}`);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    if (Date.now() - entry.cachedAt > entry.ttl) {
      localStorage.removeItem(`sp_cache_${key}`);
      return null;
    }
    return entry;
  } catch {
    return null;
  }
}

function clearOldEntries(): void {
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('sp_cache_')) keys.push(key);
  }
  // Remove oldest 20 entries
  keys.sort().slice(0, 20).forEach(k => localStorage.removeItem(k));
}

// ===== CORE CACHE FUNCTIONS =====

/**
 * Fetch with caching - the main function to use
 * Returns cached data if fresh, otherwise fetches from server
 * Uses stale-while-revalidate pattern for smooth UX
 */
export async function cachedFetch<T = any>(
  url: string,
  options?: RequestInit & { noCache?: boolean; forceRefresh?: boolean }
): Promise<T> {
  const { noCache = false, forceRefresh = false, ...fetchOptions } = options || {};
  const config = getCacheConfig();
  const cacheKey = getCacheKey(url, fetchOptions);

  // Skip cache for mutations (non-GET)
  if (fetchOptions.method && fetchOptions.method !== 'GET') {
    const response = await fetch(url, fetchOptions);
    if (response.ok) {
      // Invalidate related caches after mutation
      invalidateRelatedCaches(url);
    }
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw error;
    }
    return response.json();
  }

  if (noCache) {
    return fetch(url, fetchOptions).then(r => {
      if (!r.ok) throw { error: 'Request failed' };
      return r.json();
    });
  }

  // Check memory cache first
  const memEntry = memoryCache.get(cacheKey);
  if (memEntry && !forceRefresh && Date.now() - memEntry.cachedAt < memEntry.ttl) {
    return memEntry.data as T;
  }

  // Check localStorage
  if (!forceRefresh) {
    const storedEntry = loadFromStorage<T>(cacheKey);
    if (storedEntry) {
      // Store in memory for faster subsequent access
      memoryCache.set(cacheKey, storedEntry);
      // Trigger background refresh (stale-while-revalidate)
      if (config.enableOfflineMode) {
        backgroundRefresh(url, fetchOptions, cacheKey);
      }
      return storedEntry.data;
    }
  }

  // Deduplicate in-flight requests
  const pending = pendingRequests.get(cacheKey);
  if (pending) {
    return pending;
  }

  // Fetch from server
  const fetchPromise = fetch(url, fetchOptions)
    .then(async (response) => {
      if (!response.ok) {
        // On offline/network error, try to return stale cache
        if (config.enableOfflineMode) {
          const staleEntry = loadFromStorage<T>(cacheKey) || memoryCache.get(cacheKey) as CacheEntry<T>;
          if (staleEntry) return staleEntry.data;
        }
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw error;
      }
      const data = await response.json();
      const ttl = getTTL(url, config);
      const entry: CacheEntry<T> = { data, cachedAt: Date.now(), ttl };
      memoryCache.set(cacheKey, entry);
      saveToStorage(cacheKey, entry);
      return data;
    })
    .finally(() => {
      pendingRequests.delete(cacheKey);
    });

  pendingRequests.set(cacheKey, fetchPromise);
  return fetchPromise;
}

/**
 * Background refresh without blocking UI
 */
function backgroundRefresh(url: string, options: RequestInit, cacheKey: string): void {
  // Use requestIdleCallback if available, otherwise setTimeout
  const doRefresh = async () => {
    try {
      const response = await fetch(url, options);
      if (response.ok) {
        const data = await response.json();
        const config = getCacheConfig();
        const ttl = getTTL(url, config);
        const entry: CacheEntry<any> = { data, cachedAt: Date.now(), ttl };
        memoryCache.set(cacheKey, entry);
        saveToStorage(cacheKey, entry);
      }
    } catch {
      // Silently fail - user already has cached data
    }
  };

  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    (window as any).requestIdleCallback(doRefresh, { timeout: 5000 });
  } else {
    setTimeout(doRefresh, 1000);
  }
}

/**
 * Invalidate caches related to a URL pattern
 */
function invalidateRelatedCaches(url: string): void {
  const patterns: Record<string, string[]> = {
    '/api/lessons': ['/api/courses', '/api/dashboard'],
    '/api/courses': ['/api/dashboard', '/api/categories'],
    '/api/leaderboard': ['/api/dashboard'],
    '/api/achievements': ['/api/dashboard'],
  };

  for (const [pattern, related] of Object.entries(patterns)) {
    if (url.includes(pattern)) {
      related.forEach(rel => invalidateCache(rel));
    }
  }
  // Always invalidate the URL itself
  invalidateCache(url);
}

/**
 * Invalidate specific cache entries
 */
export function invalidateCache(urlPattern: string): void {
  const keysToDelete: string[] = [];
  // Check memory
  for (const [key] of memoryCache.entries()) {
    if (key.includes(urlPattern)) keysToDelete.push(key);
  }
  keysToDelete.forEach(k => memoryCache.delete(k));

  // Check localStorage
  keysToDelete.length = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('sp_cache_') && key.includes(urlPattern)) {
      keysToDelete.push(key);
    }
  }
  keysToDelete.forEach(k => localStorage.removeItem(k));
}

/**
 * Clear all cache
 */
export function clearAllCache(): void {
  memoryCache.clear();
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('sp_cache_')) keys.push(key);
  }
  keys.forEach(k => localStorage.removeItem(k));
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { entries: number; memoryEntries: number; estimatedSize: string } {
  let storageEntries = 0;
  let totalSize = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('sp_cache_')) {
      storageEntries++;
      totalSize += (localStorage.getItem(key) || '').length;
    }
  }
  return {
    entries: storageEntries,
    memoryEntries: memoryCache.size,
    estimatedSize: `${(totalSize / 1024).toFixed(1)} KB`,
  };
}

/**
 * Load and cache admin settings
 */
export async function getAdminSettingsCached(): Promise<any> {
  return cachedFetch('/api/admin/settings', { noCache: false });
}

/**
 * Load cache configuration from admin settings
 */
function getCacheConfig(): CacheConfig {
  if (typeof window === 'undefined') return DEFAULT_CONFIG;

  try {
    const raw = localStorage.getItem('sp_cache_config');
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}

  return DEFAULT_CONFIG;
}

/**
 * Update cache config (called when admin settings change)
 */
export function updateCacheConfig(config: Partial<CacheConfig>): void {
  const current = getCacheConfig();
  const updated = { ...current, ...config };
  if (typeof window !== 'undefined') {
    localStorage.setItem('sp_cache_config', JSON.stringify(updated));
  }
}

// ===== PREFETCH HELPER =====
/**
 * Prefetch data that will likely be needed soon
 */
export function prefetch(url: string): void {
  if (typeof window === 'undefined') return;
  const cacheKey = getCacheKey(url);
  if (memoryCache.has(cacheKey) || pendingRequests.has(cacheKey)) return;

  const fetchPromise = fetch(url)
    .then(async (response) => {
      if (!response.ok) return;
      const data = await response.json();
      const config = getCacheConfig();
      const ttl = getTTL(url, config);
      const entry: CacheEntry<any> = { data, cachedAt: Date.now(), ttl };
      memoryCache.set(cacheKey, entry);
      saveToStorage(cacheKey, entry);
    })
    .catch(() => {})
    .finally(() => {
      pendingRequests.delete(cacheKey);
    });

  pendingRequests.set(cacheKey, fetchPromise);
}
