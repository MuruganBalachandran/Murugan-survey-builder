// region imports
import { forwardRef } from 'react'
import { cn } from '@/lib/cn'
import type { CardProps, CardHeaderProps, CardBodyProps, CardFooterProps } from '@/types'
// endregion

// region Card component
export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, hover = false, clickable = false, variant = 'default', className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-2xl transition-all duration-200',
        variant === 'default' && 'bg-white border border-neutral-200 shadow-sm',
        variant === 'outline' && 'border-2 border-neutral-200 bg-white',
        variant === 'elevated' && 'bg-white shadow-lg border border-neutral-100',
        hover && 'hover:shadow-md hover:border-neutral-300',
        clickable && 'cursor-pointer hover:shadow-md active:shadow-sm',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  ),
)

Card.displayName = 'Card'
// endregion

// region CardHeader component
export const CardHeader = ({ children, className }: CardHeaderProps) => (
  <div className={cn('border-b border-neutral-200 px-6 py-4', className)}>{children}</div>
)
// endregion

// region CardBody component
export const CardBody = ({ children, className }: CardBodyProps) => (
  <div className={cn('px-6 py-4', className)}>{children}</div>
)
// endregion

// region CardFooter component
export const CardFooter = ({ children, className }: CardFooterProps) => (
  <div className={cn('border-t border-neutral-200 flex items-center justify-between gap-3 px-6 py-4', className)}>
    {children}
  </div>
)
// endregion
