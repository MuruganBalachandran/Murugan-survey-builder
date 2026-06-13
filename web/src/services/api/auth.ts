// region imports
import apiClient from './client'
// endregion

// region types
export interface AuthResponse {
  success: boolean
  message: string
  token?: string

  user?: {
    id: string
    email: string
    name: string
  }

  errors?: Record<string, string>
}
// endregion

// region helper functions
// safely return API error response
const handleApiError = (error: any) => {
  if (error.response?.data) {
    return error.response.data
  }

  throw error
}
// endregion

// region login
export const login = async (
  email: string,
  password: string,
): Promise<AuthResponse> => {
  try {
    // authenticate user
    const response =
      await apiClient.post<AuthResponse>(
        '/auth/login',
        {
          email,
          password,
        },
      )

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
    // register new user
    const response =
      await apiClient.post<AuthResponse>(
        '/auth/signup',
        {
          email,
          password,
          confirmPassword,
          name,
        },
      )

    return response.data
  } catch (error: any) {
    return handleApiError(error)
  }
}
// endregion

// region verify token
export const verifyToken = async (
  token: string,
): Promise<AuthResponse> => {
  try {
    // verify authentication token
    const response =
      await apiClient.get<AuthResponse>(
        '/auth/verify',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

    return response.data
  } catch (error: any) {
    return handleApiError(error)
  }
}
// endregion

// region logout
export const logout = async (): Promise<AuthResponse> => {
  try {
    // logout current user
    const response =
      await apiClient.post<AuthResponse>(
        '/auth/logout',
      )

    return response.data
  } catch (error: any) {
    return handleApiError(error)
  }
}
// endregion

// region exports
export default apiClient
// endregion