import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import type { BadgeProps, BadgeVariant, BadgeSize } from '@/types'
import { BADGE_VARIANTS, BADGE_SIZES } from '@/utils/constants'

const variants = BADGE_VARIANTS

const sizes = BADGE_SIZES

export const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  className,
  icon,
}: BadgeProps) => {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium',
        variants[variant],
        sizes[size],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  )
}
