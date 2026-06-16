// region imports
import type { Context } from 'hono'
import type { NotFoundResponse } from '../types'
import { HTTP_STATUS } from '../utils'
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
  return c.json(response, HTTP_STATUS.NOT_FOUND)
}
// endregion
