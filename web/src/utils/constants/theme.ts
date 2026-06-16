export const SPACING = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '2.5rem',
  '3xl': '3rem',
} as const

export const BORDER_RADIUS = {
  none: '0',
  sm: '0.375rem',
  base: '0.5rem',
  md: '0.75rem',
  lg: '1rem',
  '2xl': '1.5rem',
  full: '9999px',
} as const

export const SHADOWS = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
} as const

export const TYPOGRAPHY = {
  h1: { size: '2rem', weight: 700, lineHeight: 1.2 },
  h2: { size: '1.5rem', weight: 700, lineHeight: 1.3 },
  h3: { size: '1.25rem', weight: 600, lineHeight: 1.4 },
  h4: { size: '1rem', weight: 600, lineHeight: 1.5 },
  body: { size: '1rem', weight: 400, lineHeight: 1.5 },
  bodySmall: { size: '0.875rem', weight: 400, lineHeight: 1.5 },
  caption: { size: '0.75rem', weight: 500, lineHeight: 1.5 },
} as const

export const COLORS = {
  // Brand colors
  primary: '#3B82F6',
  primaryLight: '#DBEAFE',
  primaryDark: '#1E40AF',

  // Neutrals
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
  black: '#000000',

  // Semantic
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
} as const

export const TRANSITIONS = {
  fast: 'all 150ms ease-in-out',
  base: 'all 200ms ease-in-out',
  slow: 'all 300ms ease-in-out',
} as const
