// region imports
import { forwardRef } from 'react'
import { cn } from '@/lib/cn'
import type { ButtonProps, ButtonSize, ButtonVariant } from '@/types'

// endregion

// region constants

// per-variant tailwind classes
const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-br from-indigo-500 to-indigo-400 text-white border-none shadow-[0_4px_24px_rgba(99,102,241,0.3),0_1px_0_rgba(255,255,255,0.1)_inset]',
  secondary: 'bg-white/[0.04] text-[#C4C4D4] border border-white/10',
  tertiary: 'bg-transparent text-indigo-400 border-none shadow-none',
  danger:
    'bg-gradient-to-br from-red-500 to-red-600 text-white border-none shadow-[0_4px_24px_rgba(239,68,68,0.3),0_1px_0_rgba(255,255,255,0.1)_inset]',
  success:
    'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-none shadow-[0_4px_24px_rgba(16,185,129,0.3),0_1px_0_rgba(255,255,255,0.1)_inset]',
}

// padding + font-size + border-radius per size token
const sizes: Record<ButtonSize, string> = {
  xs: 'px-2.5 py-1.5 text-xs font-medium rounded-md',
  sm: 'px-3 py-2 text-sm font-medium rounded-lg',
  md: 'px-4 py-2.5 text-sm font-medium rounded-lg',
  lg: 'px-6 py-3 text-base font-medium rounded-xl',
  xl: 'px-8 py-3.5 text-base font-semibold rounded-xl',
}

// endregion

// region component
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      icon,
      iconPosition = 'left',
      fullWidth = false,
      className,
      disabled,
      style,
      children,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || isLoading

    // region render
    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          'inline-flex items-center justify-center gap-2',
          'tracking-[0.02em] font-semibold text-sm',
          'transition-all duration-200 ease-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#08080E]',
          'disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none',
          'hover:opacity-90 active:scale-[0.985]',
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className,
        )}
        style={style}
        {...props}
      >
        {isLoading ? (
          // spinner replaces icon when loading; label still visible
          <>
            <svg
              className="h-4 w-4 animate-spin text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {children}
          </>
        ) : (
          <>
            {icon && iconPosition === 'left' && <span className="flex-shrink-0">{icon}</span>}
            {children}
            {icon && iconPosition === 'right' && <span className="flex-shrink-0">{icon}</span>}
          </>
        )}
      </button>
    )
    // endregion
  },
)

Button.displayName = 'Button'
// endregion
