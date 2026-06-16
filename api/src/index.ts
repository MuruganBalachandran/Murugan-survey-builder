// region imports
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { errorHandler, notFoundHandler } from './middleware'
import authRoutes from './routes/auth'
import questionRoutes from './routes/questions'
import responseRoutes from './routes/responses'
import surveyRoutes from './routes/surveys'
// endregion

// app initialization
const app = new Hono<{ Bindings: Env }>()

// middleware setup
// CORS middleware
app.use(
  cors({
    origin: (origin, c) => {
      const allowed = c.env.FRONTEND_URL
      return origin === allowed ? origin : null
    },
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    exposeHeaders: ['Set-Cookie'],
    credentials: true,
  }),
)

// region routes
// health check route
app.get('/api/health', (c) => c.json({ status: 'ok' }))

// auth routes
app.route('/api/auth', authRoutes)

// survey routes
app.route('/api/surveys', surveyRoutes)

// question routes
app.route('/api/surveys', questionRoutes)

// response routes
app.route('/api/surveys', responseRoutes)

// 404 route not found handler
app.notFound(notFoundHandler)

// global error handler
app.onError(errorHandler)
// endregion

// region export
export default app
// endregion
