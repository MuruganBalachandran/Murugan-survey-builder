// region imports
import { isNonEmpty, isValidEmail, isValidPassword } from './common'
// endregion

// region auth validation utilities
// validate authentication email
export function isValidAuthEmail(email: string): boolean {
  return isNonEmpty(email) && isValidEmail(email)
}

// validate authentication password
export function isValidAuthPassword(password: string): boolean {
  return isNonEmpty(password) && isValidPassword(password)
}

// validate user name
export function isValidName(name: string): boolean {
  const trimmed = name?.trim()

  return isNonEmpty(trimmed) && trimmed.length >= 2 && trimmed.length <= 100
}

// validate password confirmation
export function doPasswordsMatch(password: string, confirmPassword: string): boolean {
  return password === confirmPassword && isNonEmpty(password)
}
// endregion

// region signup form validation
// validate signup form fields
export function validateSignupForm(data: {
  name: string
  email: string
  password: string
  confirmPassword: string
}): Record<string, boolean> {
  return {
    name: isValidName(data.name),

    email: isValidAuthEmail(data.email),

    password: isValidAuthPassword(data.password),

    confirmPassword: doPasswordsMatch(data.password, data.confirmPassword),
  }
}
// endregion

// region login form validation
// validate login form fields
export function validateLoginForm(data: {
  email: string
  password: string
}): Record<string, boolean> {
  return {
    email: isValidAuthEmail(data.email),

    password: isValidAuthPassword(data.password),
  }
}
// endregion
