
export const PUBLIC_ROUTES = ['/', '/login', '/signup', '/terms', '/privacy'] as const

export const SIZE_CLASSES = {
  LOADING: {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  },
  MODAL: {
    xs: 'max-w-xs',
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  },
  OFFCANVAS: {
    sm: 'w-4/5',
    md: 'w-4/5',
    lg: 'w-4/5',
    xl: 'w-4/5',
  },
} as const

export const BADGE_VARIANTS = {
  default: 'bg-neutral-100 text-neutral-800',
  primary: 'bg-sky-100 text-sky-800',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  error: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
} as const

export const BADGE_SIZES = {
  sm: 'px-2 py-1 text-xs font-medium rounded-md',
  md: 'px-2.5 py-1.5 text-sm font-medium rounded-lg',
  lg: 'px-3 py-2 text-base font-medium rounded-lg',
} as const

export const EMPTY_STATE_MESSAGES = {
  NO_SURVEYS: {
    title: 'No surveys yet',
    description: 'Create your first survey to get started',
  },
  NO_RESPONSES: {
    title: 'No responses yet',
    description: 'Share your survey to start collecting responses',
  },
  NO_DATA: {
    title: 'No data available',
    description: 'Check back later',
  },
} as const

export const LOADING_TEXT = 'Loading...'
export const LOADING_DEFAULT_SIZE = 'md'

export const ERROR_MESSAGES = {
  GENERIC: 'Something went wrong. Please try again.',
  NETWORK: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION: 'Please check your input and try again.',
} as const

export const SUCCESS_MESSAGES = {
  CREATED: 'Created successfully',
  UPDATED: 'Updated successfully',
  DELETED: 'Deleted successfully',
  SAVED: 'Saved successfully',
  COPIED: 'Copied to clipboard',
} as const
