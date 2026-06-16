// region imports
import apiClient from './client'
// endregion

// region types
export interface AuthResponse {
  success: boolean
  message: string
  // token is no longer returned — it lives in the httpOnly cookie
  user?: {
    id: string
    email: string
    name: string
  }
  errors?: Record<string, string>
}
// endregion

// region helpers
const handleApiError = (error: any): AuthResponse => {
  if (error.response?.data) return error.response.data
  throw error
}
// endregion

// region login
export const login = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post<AuthResponse>('/auth/login', { email, password })
    return response.data
  } catch (error: any) {
    return handleApiError(error)
  }
}
// endregion

// region signup
export const signup = async (
  email: string,
  password: string,
  confirmPassword: string,
  name: string,
): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post<AuthResponse>('/auth/signup', { email, password, confirmPassword, name })
    return response.data
  } catch (error: any) {
    return handleApiError(error)
  }
}
// endregion

// region verify token
// No token argument — the browser sends the httpOnly cookie automatically
// because withCredentials: true is set on the axios client.
export const verifyToken = async (): Promise<AuthResponse> => {
  try {
    const response = await apiClient.get<AuthResponse>('/auth/verify')
    return response.data
  } catch (error: any) {
    return handleApiError(error)
  }
}
// endregion

// region logout
export const logout = async (): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post<AuthResponse>('/auth/logout')
    return response.data
  } catch (error: any) {
    return handleApiError(error)
  }
}
// endregion

export default apiClient
