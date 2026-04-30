/**
 * Upstash Redis Rate Limiter
 * Provides distributed rate limiting using Upstash Redis
 * Free tier: 10,000 requests/day
 */

interface RateLimitConfig {
  maxRequests: number
  windowSeconds: number
}

interface RateLimitResult {
  allowed: boolean
  remaining: number
  reset: number
  retryAfter?: number
}

class UpstashRateLimiter {
  private url: string
  private token: string
  private enabled: boolean

  constructor() {
    this.url = process.env.UPSTASH_REDIS_REST_URL || ''
    this.token = process.env.UPSTASH_REDIS_REST_TOKEN || ''
    this.enabled = Boolean(this.url && this.token)
  }

  isEnabled(): boolean {
    return this.enabled
  }

  private async redisCommand<T>(command: string[]): Promise<T | null> {
    if (!this.enabled) return null

    try {
      const response = await fetch(`${this.url}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(command),
      })

      if (!response.ok) {
        console.error('Upstash Redis error:', await response.text())
        return null
      }

      const data = await response.json()
      return data.result as T
    } catch (error) {
      console.error('Upstash Redis request failed:', error)
      return null
    }
  }

  async checkLimit(
    key: string,
    config: RateLimitConfig
  ): Promise<RateLimitResult> {
    if (!this.enabled) {
      return { allowed: true, remaining: config.maxRequests, reset: Date.now() + config.windowSeconds * 1000 }
    }

    const now = Date.now()
    const windowMs = config.windowSeconds * 1000
    const windowStart = now - windowMs

    const script = `
      local key = KEYS[1]
      local now = tonumber(ARGV[1])
      local window = tonumber(ARGV[2])
      local max = tonumber(ARGV[3])
      local windowStart = now - window

      redis.call('ZREMRANGEBYSCORE', key, '-inf', windowStart)
      local count = redis.call('ZCARD', key)

      if count < max then
        redis.call('ZADD', key, now, now .. ':' .. math.random())
        redis.call('EXPIRE', key, window)
        return {1, max - count - 1, now + window}
      else
        local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
        local reset = oldest[2] and (tonumber(oldest[2]) + window) or (now + window)
        return {0, 0, reset}
      end
    `

    try {
      const result = await this.redisCommand<[number, number, number]>([
        'EVAL',
        script,
        '1',
        key,
        now.toString(),
        windowMs.toString(),
        config.maxRequests.toString(),
      ])

      if (!result) {
        return { allowed: true, remaining: config.maxRequests, reset: now + windowMs }
      }

      const [allowed, remaining, reset] = result
      return {
        allowed: allowed === 1,
        remaining,
        reset,
        retryAfter: allowed === 0 ? Math.ceil((reset - now) / 1000) : undefined,
      }
    } catch {
      return { allowed: true, remaining: config.maxRequests, reset: now + windowMs }
    }
  }

  async slidingWindow(
    key: string,
    config: RateLimitConfig
  ): Promise<RateLimitResult> {
    if (!this.enabled) {
      return { allowed: true, remaining: config.maxRequests, reset: Date.now() + config.windowSeconds * 1000 }
    }

    const now = Date.now()
    const windowMs = config.windowSeconds * 1000

    const script = `
      local key = KEYS[1]
      local now = tonumber(ARGV[1])
      local window = tonumber(ARGV[2])
      local max = tonumber(ARGV[3])
      local windowStart = now - window

      redis.call('ZREMRANGEBYSCORE', key, '-inf', windowStart)
      local count = redis.call('ZCARD', key)

      if count < max then
        redis.call('ZADD', key, now, now .. ':' .. math.random())
        redis.call('EXPIRE', key, math.ceil(window / 1000))
        return {1, max - count - 1, now + window}
      else
        return {0, 0, now + window}
      end
    `

    try {
      const result = await this.redisCommand<[number, number, number]>([
        'EVAL',
        script,
        '1',
        key,
        now.toString(),
        windowMs.toString(),
        config.maxRequests.toString(),
      ])

      if (!result) {
        return { allowed: true, remaining: config.maxRequests, reset: now + windowMs }
      }

      const [allowed, remaining, reset] = result
      return {
        allowed: allowed === 1,
        remaining,
        reset,
        retryAfter: allowed === 0 ? Math.ceil((reset - now) / 1000) : undefined,
      }
    } catch {
      return { allowed: true, remaining: config.maxRequests, reset: now + windowMs }
    }
  }

  async resetLimit(key: string): Promise<void> {
    if (!this.enabled) return
    await this.redisCommand(['DEL', key])
  }

  async getUsage(key: string): Promise<number> {
    if (!this.enabled) return 0
    const count = await this.redisCommand<number>(['ZCARD', key])
    return count || 0
  }
}

export const rateLimiter = new UpstashRateLimiter()

 export const RATE_LIMITS = {
   AI_CHAT_PER_MINUTE: { maxRequests: 10, windowSeconds: 60 },
   AI_CHAT_PER_DAY: { maxRequests: 100, windowSeconds: 86400 },
   SPIN_PER_MINUTE: { maxRequests: 5, windowSeconds: 60 },
   LESSON_COMPLETE_PER_MINUTE: { maxRequests: 20, windowSeconds: 60 },
   LOGIN_PER_MINUTE: { maxRequests: 10, windowSeconds: 60 },
   REGISTER_PER_HOUR: { maxRequests: 5, windowSeconds: 3600 },
   API_GENERAL_PER_MINUTE: { maxRequests: 100, windowSeconds: 60 },
   API_GENERAL_PER_HOUR: { maxRequests: 1000, windowSeconds: 3600 },
   PUSH_BROADCAST_PER_HOUR: { maxRequests: 5, windowSeconds: 3600 }, // Limit admins to 5 broadcasts per hour
 } as const

export type RateLimitKey = keyof typeof RATE_LIMITS
