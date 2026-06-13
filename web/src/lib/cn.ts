import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
/**
 * Merge and deduplicate Tailwind classes
 */
// export function cn(...classes: (string | undefined | false | null)[]): string {
//   return classes
//     .filter((c): c is string => typeof c === 'string')
//     .join(' ')
//     .split(/\s+/)
//     .filter((c) => c.length > 0)
//     .join(' ')
// }

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
