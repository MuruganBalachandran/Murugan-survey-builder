// region imports
import type { Context } from 'hono'
// endregion

// region types
interface NotFoundError {
  code: 'NOT_FOUND'
  path: string
  method: string
}

interface NotFoundResponse {
  success: false
  message: string
  error: NotFoundError
  timestamp: string
}
// endregion

// region middleware
export const notFoundHandler = (c: Context): Response => {
  // build response
  const response: NotFoundResponse = {
    success: false,
    message: 'The requested resource was not found',
    error: {
      code: 'NOT_FOUND',
      path: c.req.path,
      method: c.req.method,
    },
    timestamp: new Date().toISOString(),
  }

  // log not found
  console.warn(`[NOT_FOUND] ${c.req.method} ${c.req.path}`)

  // return response
  return c.json(response, 404)
}
// endregion
