// region imports
import { Hono } from 'hono'
import { login, logout, signup, verify } from '../controllers/authController'
import { authMiddleware, rateLimitMiddleware } from '../middleware'
// endregion

// region routes initialization
const authRoutes = new Hono()
// endregion

// region auth endpoints
// section signup - rate limited
authRoutes.post('/signup', rateLimitMiddleware, signup)

// section login - rate limited
authRoutes.post('/login', rateLimitMiddleware, login)

// section verify token
authRoutes.get('/verify', verify)

// section logout - protected and rate limited
authRoutes.post('/logout', rateLimitMiddleware, authMiddleware, logout)
// endregion

// region export
export default authRoutes
// endregion
