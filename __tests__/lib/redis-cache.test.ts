import { isRedisAvailable, cacheGet, cacheSet, cacheDelete, cacheGetOrSet, CACHE_KEYS, CACHE_TTL } from '@/lib/redis-cache'

describe('Redis Cache Utils', () => {
  describe('isRedisAvailable', () => {
    it('should return false when no Redis URL is configured', () => {
      // By default, process.env.UPSTASH_REDIS_REST_URL is not set in test
      expect(isRedisAvailable()).toBe(false)
    })
  })

  describe('CACHE_KEYS', () => {
    it('should have correct structure for static keys', () => {
      expect(CACHE_KEYS.COURSES_LIST).toBe('courses:list')
      expect(CACHE_KEYS.CATEGORIES_LIST).toBe('categories:list')
    })

    it('should have factory functions for dynamic keys', () => {
      expect(CACHE_KEYS.COURSES_DETAIL('abc123')).toBe('courses:abc123')
      expect(CACHE_KEYS.DASHBOARD('user123')).toBe('dashboard:user123')
    })
  })

  describe('CACHE_TTL', () => {
    it('should have TTL values in seconds', () => {
      expect(CACHE_TTL.COURSES).toBe(1800) // 30 minutes
      expect(CACHE_TTL.CATEGORIES).toBe(3600) // 1 hour
      expect(CACHE_TTL.LEADERBOARD_DAILY).toBe(300) // 5 minutes
      expect(CACHE_TTL.DASHBOARD).toBe(120) // 2 minutes
    })
  })

  describe('cacheGet', () => {
    it('should return null when Redis is not available', async () => {
      const result = await cacheGet('test-key')
      expect(result).toBeNull()
    })
  })

  describe('cacheSet', () => {
    it('should return false when Redis is not available', async () => {
      const result = await cacheSet('test-key', { test: 'data' })
      expect(result).toBe(false)
    })
  })

  describe('cacheDelete', () => {
    it('should return false when Redis is not available', async () => {
      const result = await cacheDelete('test-key')
      expect(result).toBe(false)
    })
  })

  describe('cacheGetOrSet', () => {
    it('should return fetched data when Redis is not available', async () => {
      const fetcher = jest.fn().mockResolvedValue({ test: 'value' })
      const result = await cacheGetOrSet('test-key', fetcher)
      
      expect(result).toEqual({ test: 'value' })
      expect(fetcher).toHaveBeenCalled()
    })
  })
})
