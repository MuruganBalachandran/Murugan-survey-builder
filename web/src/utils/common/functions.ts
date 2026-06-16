// region imports
import type { ModalVariant, ToastVariant, VariantStyles, VariantToastStyles } from '@/types'
// endregion

// region color utilities

// validate hex color format
export function isValidHexColor(color: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(color)
}

// convert hex color to rgb
export function hexToRgb(hex: string): {
  r: number
  g: number
  b: number
} | null {
  // return null if hex is empty
  if (!hex) return null

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)

  return result && result[1] && result[2] && result[3]
    ? {
        r: parseInt(result[1], 16),

        g: parseInt(result[2], 16),

        b: parseInt(result[3], 16),
      }
    : null
}

// convert rgb values to hex
export function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b]
    .map((x) => Math.min(255, Math.max(0, x)).toString(16).padStart(2, '0'))
    .join('')}`
}

// calculate color luminance
export function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex)

  // fallback luminance
  if (!rgb) return 0.5

  const { r, g, b } = rgb

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

  return luminance
}

// get readable contrast color
export function getContrastColor(hex: string): string {
  const luminance = getLuminance(hex)

  return luminance > 0.5 ? '#000000' : '#FFFFFF'
}

// lighten hex color
export function lightenColor(hex: string, amount: number): string {
  const rgb = hexToRgb(hex)

  // return original color if invalid
  if (!rgb) return hex

  const { r, g, b } = rgb

  return rgbToHex(
    Math.round(r + (255 - r) * amount),

    Math.round(g + (255 - g) * amount),

    Math.round(b + (255 - b) * amount),
  )
}

// darken hex color
export function darkenColor(hex: string, amount: number): string {
  const rgb = hexToRgb(hex)

  // return original color if invalid
  if (!rgb) return hex

  const { r, g, b } = rgb

  return rgbToHex(
    Math.round(r * (1 - amount)),

    Math.round(g * (1 - amount)),

    Math.round(b * (1 - amount)),
  )
}
// endregion

// region date utilities
// format date values
export function formatDate(
  date: string | Date,

  format: 'short' | 'long' | 'relative' = 'long',
): string {
  const d = typeof date === 'string' ? new Date(date) : date

  // validate date object
  if (!d || isNaN(d.getTime())) {
    return 'Invalid date'
  }

  switch (format) {
    case 'short':
      return d.toLocaleDateString('en-US', {
        month: 'short',

        day: 'numeric',

        year: d.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
      })

    case 'long':
      return d.toLocaleDateString('en-US', {
        weekday: 'short',

        month: 'short',

        day: 'numeric',

        year: 'numeric',

        hour: '2-digit',

        minute: '2-digit',
      })

    case 'relative': {
      const now = new Date()

      const diff = now.getTime() - d.getTime()

      const minutes = Math.floor(diff / 60000)

      const hours = Math.floor(diff / 3600000)

      const days = Math.floor(diff / 86400000)

      // show recent timestamp
      if (minutes < 1) return 'Just now'

      if (minutes < 60) return `${minutes}m ago`

      if (hours < 24) return `${hours}h ago`

      if (days < 7) return `${days}d ago`

      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    }
  }
}

// format time values
export function formatTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date

  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}
// endregion

// region storage utilities
// store value in local storage
export function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`Failed to save to localStorage (${key}):`, error)
  }
}

// retrieve value from local storage
export function getItem<T>(key: string, defaultValue?: T): T | null {
  try {
    const item = localStorage.getItem(key)

    return item ? JSON.parse(item) : (defaultValue ?? null)
  } catch (error) {
    console.error(`Failed to read from localStorage (${key}): ${error}`)

    return defaultValue ?? null
  }
}

// remove item from local storage
export function removeItem(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error(`Failed to remove from localStorage (${key}):`, error)
  }
}

// clear local storage
export function clearAllStorage(): void {
  try {
    localStorage.clear()
  } catch (error) {
    console.error('Failed to clear localStorage:', error)
  }
}
// endregion

// region id utilities

// generate unique identifier
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}
// endregion

// region file utilities
// convert file to data url
export const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => resolve(String(reader.result || ''))

    reader.onerror = () => reject(new Error('Failed to read file'))

    reader.readAsDataURL(file)
  })
// endregion

// region modal variant utilities
export const getModalVariantStyles = (variant: ModalVariant): VariantStyles => {
  const baseClasses = 'h-12 w-12 flex items-center justify-center rounded-full'

  switch (variant) {
    case 'danger':
      return {
        iconBg: `${baseClasses} bg-red-100`,

        iconColor: 'text-red-600',

        confirmButtonClass: 'bg-red-600 hover:bg-red-700',
      }

    case 'warning':
      return {
        iconBg: `${baseClasses} bg-yellow-100`,

        iconColor: 'text-yellow-600',

        confirmButtonClass: 'bg-yellow-600 hover:bg-yellow-700',
      }

    case 'success':
      return {
        iconBg: `${baseClasses} bg-emerald-100`,

        iconColor: 'text-emerald-600',

        confirmButtonClass: 'bg-emerald-600 hover:bg-emerald-700',
      }

    case 'info':
      return {
        iconBg: `${baseClasses} bg-blue-100`,

        iconColor: 'text-blue-600',

        confirmButtonClass: 'bg-blue-600 hover:bg-blue-700',
      }

    default:
      return {
        iconBg: `${baseClasses} bg-violet-100`,

        iconColor: 'text-violet-600',

        confirmButtonClass: 'bg-violet-600 hover:bg-violet-700',
      }
  }
}
// endregion

// region toast variant utilities
export const getToastVariantStyles = (variant: ToastVariant): VariantToastStyles => {
  const toastStyles: Record<ToastVariant, VariantToastStyles> = {
    success: {
      icon: '✓',

      iconClassName: 'bg-emerald-100 text-emerald-700',

      accentClassName: 'bg-emerald-500',

      description: 'Success',
    },

    error: {
      icon: '×',

      iconClassName: 'bg-red-100 text-red-700',

      accentClassName: 'bg-red-500',

      description: 'Error',
    },

    warning: {
      icon: '!',

      iconClassName: 'bg-amber-100 text-amber-700',

      accentClassName: 'bg-amber-500',

      description: 'Warning',
    },

    info: {
      icon: 'i',

      iconClassName: 'bg-violet-100 text-violet-700',

      accentClassName: 'bg-gradient-to-r from-violet-600 to-blue-500',

      description: 'Information',
    },
  }

  return toastStyles[variant]
}
// endregion
