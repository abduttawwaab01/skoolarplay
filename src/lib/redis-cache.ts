/**
 * Redis Cache Layer using Upstash REST API
 * Provides server-side data caching to reduce database load
 */

const redisUrl = process.env.UPSTASH_REDIS_REST_URL
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN

const DEFAULT_TTL = 60 * 30 // 30 minutes

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${redisToken}`,
  }
}

export const isRedisAvailable = () => 
  Boolean(redisUrl && redisUrl.trim() && redisToken && redisToken.trim())

async function redisRequest(command: string[]): Promise<any> {
  if (!redisUrl || !redisToken) return null
  
  try {
    const response = await fetch(`${redisUrl}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(command),
    })
    
    if (!response.ok) {
      console.error('Redis request failed:', response.status)
      return null
    }
    
    const data = await response.json()
    return data.result
  } catch (error) {
    console.error('Redis request error:', error)
    return null
  }
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  const result = await redisRequest(['GET', key])
  if (result === null || result === '') return null
  try {
    return JSON.parse(result) as T
  } catch {
    return result as T
  }
}

export async function cacheSet(
  key: string,
  value: any,
  ttl: number = DEFAULT_TTL
): Promise<boolean> {
  const serialized = JSON.stringify(value)
  const result = await redisRequest(['SET', key, serialized, 'EX', String(ttl)])
  return result === 'OK'
}

export async function cacheDelete(key: string): Promise<boolean> {
  const result = await redisRequest(['DEL', key])
  return result > 0
}

export async function cacheDeletePattern(pattern: string): Promise<number> {
  const keys = await redisKeys(pattern)
  if (keys.length === 0) return 0
  
  const result = await redisRequest(['DEL', ...keys])
  return result
}

export async function redisKeys(pattern: string): Promise<string[]> {
  const result = await redisRequest(['KEYS', pattern])
  return Array.isArray(result) ? result : []
}

export async function cacheGetOrSet<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = DEFAULT_TTL
): Promise<T> {
  const cached = await cacheGet<T>(key)
  if (cached !== null) {
    return cached
  }

  const data = await fetcher()
  await cacheSet(key, data, ttl)
  return data
}

export const CACHE_KEYS = {
  COURSES_LIST: 'courses:list',
  COURSES_DETAIL: (id: string) => `courses:${id}`,
  CATEGORIES_LIST: 'categories:list',
  LEADERBOARD_DAILY: 'leaderboard:daily',
  LEADERBOARD_WEEKLY: 'leaderboard:weekly',
  LEADERBOARD_ALL: 'leaderboard:all',
  LEADERBOARD_LEAGUES: 'leaderboard:leagues',
  SHOP_ITEMS: 'shop:items',
  DASHBOARD: (userId: string) => `dashboard:${userId}`,
  USER_PROFILE: (userId: string) => `user:profile:${userId}`,
  ACHIEVEMENTS_LIST: 'achievements:list',
}

export const CACHE_TTL = {
  COURSES: 60 * 30, // 30 minutes
  CATEGORIES: 60 * 60, // 1 hour
  LEADERBOARD_DAILY: 60 * 5, // 5 minutes
  LEADERBOARD_WEEKLY: 60 * 15, // 15 minutes
  LEADERBOARD_ALL: 60 * 30, // 30 minutes
  LEADERBOARD_LEAGUES: 60 * 30, // 30 minutes
  SHOP_ITEMS: 60 * 15, // 15 minutes
  DASHBOARD: 60 * 2, // 2 minutes (user-specific, shorter)
  USER_PROFILE: 60 * 10, // 10 minutes
}
