import { forwardRef } from 'react'
import { cn } from '@/lib/cn'
import type { TextareaProps } from '@/types'

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    { label, error, hint, maxLength, showCharCount = true, className, id, value, ...props },
    ref,
  ) => {
    const inputId = id || props.name
    const charCount = typeof value === 'string' ? value.length : 0
    const charPercentage = maxLength ? Math.round((charCount / maxLength) * 100) : 0

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="mb-2 block text-sm font-medium text-neutral-700">
            {label}
            {props.required && <span className="ml-1 text-error-500">*</span>}
          </label>
        )}

        <textarea
          ref={ref}
          id={inputId}
          value={value}
          maxLength={maxLength}
          className={cn(
            'w-full rounded-lg border bg-white px-4 py-2.5 text-sm font-normal text-neutral-900 placeholder-neutral-400',
            'border-neutral-300 transition-all duration-200 resize-vertical',
            'hover:border-neutral-400',
            'focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100',
            'disabled:bg-neutral-50 disabled:text-neutral-500 disabled:cursor-not-allowed disabled:border-neutral-200',
            error && 'border-error-500 focus:ring-error-100 focus:border-error-500',
            className,
          )}
          {...props}
        />

        <div className="mt-1.5 flex items-center justify-between">
          <div>
            {error && <p className="text-sm font-medium text-error-600">{error}</p>}
            {hint && !error && <p className="text-sm text-neutral-500">{hint}</p>}
          </div>

          {maxLength && showCharCount && (
            <p
              className={cn(
                'text-xs font-medium',
                charPercentage > 90 ? 'text-warning-600' : 'text-neutral-400',
              )}
            >
              {charCount} / {maxLength}
            </p>
          )}
        </div>
      </div>
    )
  },
)

Textarea.displayName = 'Textarea'
