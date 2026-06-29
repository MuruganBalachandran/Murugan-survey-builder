// region imports
import type { Context, Next } from 'hono'
import type { AuthContext, UnauthorizedResponse } from '../types'
import { HTTP_STATUS, verifyToken, getTokenFromCookie } from '../utils'
// endregion

export type { AuthContext }

// region middleware

// Middleware to verify the client's session using the secure HTTP-only JWT cookie
export const authMiddleware = async (c: Context, next: Next) => {
  try {
    // Extract the raw HTTP Cookie header value from the request headers
    const cookieHeader = c.req.header('Cookie') ?? ''
    // Extract the 'auth_token' value using the cookie utility
    const token = getTokenFromCookie(cookieHeader)

    if (!token) {
      const response: UnauthorizedResponse = { success: false, message: 'Not authenticated' }
      return c.json(response, HTTP_STATUS.UNAUTHORIZED)
    }

    const payload = await verifyToken(token, c.env)

    if (!payload) {
      const response: UnauthorizedResponse = { success: false, message: 'Invalid or expired token' }
      return c.json(response, HTTP_STATUS.UNAUTHORIZED)
    }

    // Attach verified user identity to the request context
    c.set('user', { userId: payload.userId, email: payload.email })

    // Continue to next middleware/handler
    await next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    const response: UnauthorizedResponse = { success: false, message: 'Authentication error' }
    return c.json(response, HTTP_STATUS.UNAUTHORIZED)
  }
}
// endregion
