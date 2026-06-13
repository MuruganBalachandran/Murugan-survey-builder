// imports
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import authRoutes from './routes/auth'
import surveyRoutes from './routes/surveys'
import questionRoutes from './routes/questions'
import responseRoutes from './routes/responses'
import { errorHandler, notFoundHandler } from './middleware'

// app initialization
const app = new Hono<{ Bindings: Env }>()

// middleware setup
// CORS middleware
app.use(
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  }),
)

// routes
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

// error handling
// 404 not found handler (must be last)
app.notFound(notFoundHandler)

// global error handler (must be last)
app.onError(errorHandler)

// export
export default app

