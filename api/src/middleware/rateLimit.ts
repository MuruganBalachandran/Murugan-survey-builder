// region imports
import type { Context, Next } from 'hono'
// endregion

// region types
interface RateLimitRecord {
  count: number
  resetAt: number
}
// endregion

// region constants
const WINDOW_MS = 5 * 60 * 1000 // 5 minutes
const MAX_REQUESTS = 5
// endregion

// region in-memory store
// stores temporary rate limit data
const store = new Map<string, RateLimitRecord>()
// endregion

// region helper functions

// returns client IP address from request headers
const getClientIp = (c: Context): string => {
  return (
    c.req.header('cf-connecting-ip') ||
    c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
    c.req.header('x-real-ip') ||
    'unknown'
  )
}

// endregion

// region middleware

export const rateLimitMiddleware = async (
  c: Context,
  next: Next,
): Promise<Response | void> => {
  // unique identifier for tracking requests
  const key = getClientIp(c)

  // current timestamp
  const now = Date.now()

  // existing rate limit data for current user
  const existing = store.get(key)

  // create new rate limit window if:
  // 1. user has no previous requests
  // 2. previous window expired
  if (!existing || now > existing.resetAt) {
    store.set(key, {
      count: 1,
      resetAt: now + WINDOW_MS,
    })

    // rate limit response headers
    c.header('X-RateLimit-Limit', MAX_REQUESTS.toString())
    c.header('X-RateLimit-Remaining', (MAX_REQUESTS - 1).toString())

    await next()
    return
  }

  // block request if limit reached
  if (existing.count >= MAX_REQUESTS) {
    // remaining wait time in seconds
    const retryAfter = Math.ceil((existing.resetAt - now) / 1000)

    // response headers
    c.header('Retry-After', retryAfter.toString())
    c.header('X-RateLimit-Limit', MAX_REQUESTS.toString())
    c.header('X-RateLimit-Remaining', '0')

    return c.json(
      {
        success: false,
        message: 'Too many requests. Please try again later.',
        retryAfter,
      },
      429,
    )
  }

  // increase request count
  existing.count++

  // update remaining requests header
  c.header('X-RateLimit-Limit', MAX_REQUESTS.toString())
  c.header('X-RateLimit-Remaining', (MAX_REQUESTS - existing.count).toString())

  // continue request
  await next()
}

// endregion