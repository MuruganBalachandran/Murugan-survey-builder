// region imports
import type { Context, Next } from 'hono'
import { verifyToken } from '../utils'
// endregion

// region types
export interface AuthContext {
  userId: string
  email: string
}

interface UnauthorizedResponse {
  success: false
  message: string
}
// endregion

// region middleware
export const authMiddleware = async (c: Context, next: Next): Promise<Response | undefined> => {
  try {
    //  extract token
    const authHeader = c.req.header('Authorization')

    // check auth header format
    if (!authHeader?.startsWith('Bearer ')) {
      const response: UnauthorizedResponse = {
        success: false,
        message: 'Missing or invalid authorization header',
      }
      return c.json(response, 401)
    }

    // 
    const token = authHeader.substring(7)

    // verify token
    const payload = await verifyToken(token)

    // if payload is invalid or token is expired
    if (!payload) {
      const response: UnauthorizedResponse = {
        success: false,
        message: 'Invalid or expired token',
      }
      return c.json(response, 401)
    }

    // attach user to context
    c.set('user', {
      userId: payload.userId,
      email: payload.email,
    })

    // move to next middleware or route handler
    await next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    const response: UnauthorizedResponse = {
      success: false,
      message: 'Authentication error',
    }
    return c.json(response, 401)
  }
}
// endregion