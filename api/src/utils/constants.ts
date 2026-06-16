// region http status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const
// endregion

// region auth constants
export const PASSWORD_MIN_LENGTH = 8
export const NAME_MIN_LENGTH = 2

export const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const REGEX_PASSWORD_LOWERCASE = /[a-z]/
export const REGEX_PASSWORD_UPPERCASE = /[A-Z]/
export const REGEX_PASSWORD_SPECIAL = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/
// endregion

// region survey constants
export const SURVEY_TITLE_MIN_LENGTH = 3
export const SURVEY_TITLE_MAX_LENGTH = 200
export const SURVEY_DESCRIPTION_MIN_LENGTH = 10
export const SURVEY_DESCRIPTION_MAX_LENGTH = 1000

export const REGEX_HEX_COLOR = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
export const REGEX_LOGO_URL = /^(https?:\/\/|data:image\/).*$/i

export const VALID_SURVEY_STATUSES = ['draft', 'published', 'closed'] as const
export const DEFAULT_PRIMARY_COLOR = '#6366F1'
// endregion

// region question constants
export const QUESTION_TITLE_MIN_LENGTH = 3
export const QUESTION_TITLE_MAX_LENGTH = 500
export const QUESTION_DESCRIPTION_MAX_LENGTH = 1000
export const MIN_OPTIONS = 2
export const MAX_OPTIONS = 50

export const VALID_QUESTION_TYPES = [
  'short_text',
  'long_text',
  'multiple_choice',
  'checkbox_group',
  'dropdown',
  'rating',
  'yes_no',
] as const
// endregion

// region rate limit constants
export const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000 // 5 minutes
export const RATE_LIMIT_MAX_REQUESTS = 5
// endregion

// region password hashing constants
export const PBKDF2_ITERATIONS = 100_000
export const PBKDF2_KEY_LENGTH = 32
export const SALT_BYTE_LENGTH = 16
// endregion
