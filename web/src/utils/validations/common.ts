// region email validation utilities
// validate email format
export function isValidEmail(
  email: string,
): boolean {
  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  return emailRegex.test(
    email,
  )
}
// endregion

// region password validation utilities
// validate password length
export function isValidPassword(
  password: string,
): boolean {
  return (
    password.length >= 8
  )
}

// get password strength level
export function getPasswordStrength(
  password: string,
):
  | 'weak'
  | 'medium'
  | 'strong' {
  // weak password check
  if (password.length < 8)
    return 'weak'

  // medium password check
  if (
    password.length < 12 ||
    !/[A-Z]/.test(password) ||
    !/[0-9]/.test(password)
  ) {
    return 'medium'
  }

  // strong password
  return 'strong'
}
// endregion

// region url validation utilities
// validate url format
export function isValidUrl(
  url: string,
): boolean {
  try {
    new URL(url)

    return true
  } catch {
    return false
  }
}
// endregion

// region color validation utilities
// validate hex color format
export function isValidHexColor(
  color: string,
): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(
    color,
  )
}
// endregion

// region empty value utilities

// check whether value is empty
export function isEmpty(
  value: any,
): boolean {
  return (
    value === null ||
    value === undefined ||
    value === '' ||
    (Array.isArray(value) &&
      value.length === 0) ||
    (typeof value ===
      'object' &&
      Object.keys(value)
        .length === 0)
  )
}

// check whether value is non-empty
export function isNonEmpty(
  value: any,
): value is NonNullable<
  typeof value
> {
  return !isEmpty(value)
}
// endregion

// region numeric validation utilities
// validate numeric value
export function isValidNumber(
  value: any,
): boolean {
  return (
    !isNaN(value) &&
    isFinite(value)
  )
}
// endregion

// region string validation utilities
// validate string length range
export function isWithinLength(
  value: string,
  min: number,
  max: number,
): boolean {
  const len =
    value.trim().length

  return (
    len >= min &&
    len <= max
  )
}
// endregion

// region array validation utilities
// check for unique array values
export function hasUniqueValues(
  arr: string[],
): boolean {
  const cleaned = arr
    .map((item) =>
      item.trim(),
    )
    .filter(Boolean)

  const unique = new Set(
    cleaned,
  )

  return (
    unique.size ===
    cleaned.length
  )
}
// endregion