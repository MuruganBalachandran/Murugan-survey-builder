// region imports
import { forwardRef } from 'react'
import { cn } from '@/lib/cn'
import type { ButtonProps, ButtonVariant, ButtonSize } from '@/types'
// endregion

// region constants

// per-variant inline styles — gradient backgrounds, shadows, text colours
const variants: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    background: 'linear-gradient(135deg, #6366F1 0%, #7C7FF5 100%)',
    color: '#fff',
    border: 'none',
    boxShadow: '0 4px 24px rgba(99,102,241,0.3), 0 1px 0 rgba(255,255,255,0.1) inset',
  },
  secondary: {
    background: 'rgba(255,255,255,0.04)',
    color: '#C4C4D4',
    border: '0.5px solid rgba(255,255,255,0.1)',
    boxShadow: 'none',
  },
  tertiary: {
    background: 'transparent',
    color: '#818CF8',
    border: 'none',
    boxShadow: 'none',
  },
  danger: {
    background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
    color: '#fff',
    border: 'none',
    boxShadow: '0 4px 24px rgba(239,68,68,0.3), 0 1px 0 rgba(255,255,255,0.1) inset',
  },
  success: {
    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    color: '#fff',
    border: 'none',
    boxShadow: '0 4px 24px rgba(16,185,129,0.3), 0 1px 0 rgba(255,255,255,0.1) inset',
  },
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
          'transition-all duration-200 ease-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#08080E]',
          'disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none',
          'active:scale-[0.985]',
          sizes[size],
          fullWidth && 'w-full',
          className,
        )}
        style={{
          ...variants[variant],
          letterSpacing: '0.02em',
          fontWeight: 600,
          fontSize: '14px',
          // disabled state overrides shadow and cursor via inline style
          ...(isDisabled && { opacity: 0.4, cursor: 'not-allowed', boxShadow: 'none' }),
          ...style,
        }}
        onMouseOver={(e) => { if (!isDisabled) e.currentTarget.style.opacity = '0.88' }}
        onMouseOut={(e) => { e.currentTarget.style.opacity = '1' }}
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
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
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
