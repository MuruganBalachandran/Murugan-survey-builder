// region imports
import type { PasswordValidation } from '@/types/auth'
// endregion

// region password validation utilities

// validate password rules
export const validatePasswordRules = (password: string): PasswordValidation => ({
  minLength: password.length >= 8,

  hasLowercase: /[a-z]/.test(password),

  hasUppercase: /[A-Z]/.test(password),

  hasSpecial: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
})

// check whether password is valid
export const isPasswordValid = (validation: PasswordValidation): boolean =>
  validation.minLength &&
  validation.hasLowercase &&
  validation.hasUppercase &&
  validation.hasSpecial

// endregion

// region password rules config

// password requirement labels
export const PASSWORD_RULES = [
  {
    key: 'minLength' as const,
    label: '8+ characters',
  },

  {
    key: 'hasLowercase' as const,
    label: 'Lowercase letter',
  },

  {
    key: 'hasUppercase' as const,
    label: 'Uppercase letter',
  },

  {
    key: 'hasSpecial' as const,
    label: 'Special character',
  },
] as const
// endregion
