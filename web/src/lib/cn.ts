// region imports
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
// endregion

// region cn
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
// endregion
