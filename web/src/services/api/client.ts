// region imports
import axios from 'axios'
// endregion

// region constants

// backend API base URL
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  'http://localhost:8787/api'

// prevent multiple session expiry events
let sessionExpiryHandled = false

// endregion

// region api client
export const apiClient = axios.create({
  baseURL: API_BASE_URL,

  headers: {
    'Content-Type': 'application/json',
  },
})
// endregion

// region request interceptor
apiClient.interceptors.request.use((config) => {
  // fetch stored auth token
  const token = localStorage.getItem('authToken')

  // attach bearer token to request
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => {
    // reset flag on any successful authenticated response
    if (response.config.headers?.Authorization) {
      sessionExpiryHandled = false
    }
    return response
  },
)

// endregion

// region response interceptor
apiClient.interceptors.response.use(
  (response) => response,

  (error) => {
    // check if user has active session
    const hasToken = Boolean(
      localStorage.getItem('authToken'),
    )

    // handle expired or invalid session
    if (
      error.response?.status === 401 &&
      hasToken &&
      !sessionExpiryHandled &&
      !error.config?.url?.includes('/auth/verify')
    ) {
      sessionExpiryHandled = true

      // clear stored session token
      localStorage.removeItem('authToken')

      // notify application about session expiry
      window.dispatchEvent(
        new CustomEvent('auth:session-expired'),
      )
    }

    return Promise.reject(error)
  },
)

// endregion

// region exports
export default apiClient
// endregion