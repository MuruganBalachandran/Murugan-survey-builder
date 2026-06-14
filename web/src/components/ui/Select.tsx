// region imports
import { forwardRef, type ReactNode } from 'react'
import { cn } from '@/lib/cn'
import type { SelectProps } from '@/types'
// endregion

// region component
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, options, placeholder, icon, className, id, ...props }, ref) => {
    const inputId = id || props.name

    // region render
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="mb-2 block text-sm font-medium text-neutral-700">
            {label}
            {props.required && <span className="ml-1 text-error-500">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {/* optional leading icon */}
          {icon && (
            <div className="pointer-events-none absolute left-3 flex items-center text-neutral-400">
              {icon}
            </div>
          )}

          <select
            ref={ref}
            id={inputId}
            className={cn(
              'w-full rounded-lg border bg-white py-2.5 text-sm font-normal text-neutral-900',
              'border-neutral-300 transition-all duration-200 appearance-none',
              'hover:border-neutral-400',
              'focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100',
              'disabled:bg-neutral-50 disabled:text-neutral-500 disabled:cursor-not-allowed disabled:border-neutral-200',
              icon && 'pl-10',
              error && 'border-error-500 focus:ring-error-100 focus:border-error-500',
              className,
            )}
            {...props}
          >
            {/* placeholder shown as a non-selectable default option */}
            {placeholder && (
              <option value="" disabled hidden>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {error && <p className="mt-1.5 text-sm font-medium text-error-600">{error}</p>}
        {hint && !error && <p className="mt-1.5 text-sm text-neutral-500">{hint}</p>}
      </div>
    )
    // endregion
  },
)

Select.displayName = 'Select'
// endregion
