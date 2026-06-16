// region imports
import type { Context, Next } from 'hono'
import type { AuthContext, UnauthorizedResponse } from '../types'
import { HTTP_STATUS, verifyToken } from '../utils'
// endregion

export type { AuthContext }

// region middleware
export const authMiddleware = async (c: Context, next: Next): Promise<Response | undefined> => {
  try {
    // Read JWT from the httpOnly cookie set at login/signup
    const cookie = c.req.header('Cookie') ?? ''
    const match = cookie.match(/(?:^|;\s*)auth_token=([^;]+)/)
    const token = match?.[1] ?? null

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

    await next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    const response: UnauthorizedResponse = { success: false, message: 'Authentication error' }
    return c.json(response, HTTP_STATUS.UNAUTHORIZED)
  }
}
// endregion
