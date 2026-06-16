// region imports
import axios from 'axios'
// endregion

// region constants
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787/api'

// Prevent multiple session-expiry events firing in the same error burst
let sessionExpiryHandled = false
// endregion

// region api client
// withCredentials: true — tells the browser to include the httpOnly cookie
// on every request automatically. No manual token attachment needed.
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})
// endregion

// region response interceptors
// Reset the expiry flag after any successful response
apiClient.interceptors.response.use((response) => {
  sessionExpiryHandled = false
  return response
})

// Handle 401 — session expired or cookie missing
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      !sessionExpiryHandled &&
      !error.config?.url?.includes('/auth/verify')
    ) {
      sessionExpiryHandled = true
      // Notify the app — root layout listens and redirects to login
      window.dispatchEvent(new CustomEvent('auth:session-expired'))
    }

    return Promise.reject(error)
  },
)
// endregion

export default apiClient
