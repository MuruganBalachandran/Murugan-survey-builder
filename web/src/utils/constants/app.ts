/**
 * Application-wide constants
 */

export const APP_NAME = 'Survey Builder'
export const APP_DESCRIPTION = 'Create beautiful surveys in minutes'
export const APP_VERSION = '1.0.0'

export const API_BASE_URL = '/api'
export const API_HEALTH_URL = '/api/health'

export const STORAGE_KEYS = {
  SURVEY_DRAFTS: 'survey:drafts',
  SESSION_KEY: 'auth:session',
  USER_PREFERENCES: 'user:preferences',
  THEME_PREFERENCE: 'theme:preference',
} as const

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
} as const

export const LIMITS = {
  MAX_SURVEY_TITLE_LENGTH: 200,
  MAX_SURVEY_DESCRIPTION_LENGTH: 1000,
  MAX_QUESTION_TITLE_LENGTH: 500,
  MAX_QUESTION_DESCRIPTION_LENGTH: 1000,
  MAX_OPTION_LENGTH: 200,
  MIN_OPTIONS_FOR_MULTIPLE_CHOICE: 2,
  MAX_OPTIONS_FOR_MULTIPLE_CHOICE: 50,
} as const

export const DEBOUNCE_TIMES = {
  SEARCH: 300,
  AUTOSAVE: 1000,
  INPUT: 300,
} as const
