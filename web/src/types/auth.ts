import type { ReactNode } from 'react'

// AuthLayout
export interface AuthLayoutProps {
  children: ReactNode
  title: string
  subtitle?: string
}

// LoginForm
export interface LoginFormProps {
  onSuccess?: () => void
}

export interface LoginFormData {
  email: string
  password: string
}

// SignupForm
export interface SignupFormProps {
  onSuccess?: () => void
}

export interface SignupFormData {
  name: string
  email: string
  password: string
  confirmPassword: string
  terms: boolean
}

export interface PasswordValidation {
  minLength: boolean
  hasLowercase: boolean
  hasUppercase: boolean
  hasSpecial: boolean
}

export interface FieldErrors {
  [key: string]: string
}

// Store
export interface User {
  id: string
  email: string
  name: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}
