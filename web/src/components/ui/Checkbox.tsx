// region imports
import { forwardRef } from 'react'
import { cn } from '@/lib/cn'
import type { CheckboxProps } from '@/types'
// endregion

// region component
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const checkboxId = id || props.name

    // region render
    return (
      <div className="flex items-start">
        <div className="flex items-center h-6">
          <input
            ref={ref}
            id={checkboxId}
            type="checkbox"
            className={cn(
              'h-4 w-4 rounded border-neutral-300 bg-white text-sky-600',
              'border transition-all duration-200',
              'hover:border-neutral-400',
              'focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus:outline-none',
              'disabled:bg-neutral-50 disabled:cursor-not-allowed disabled:border-neutral-200',
              'cursor-pointer',
              className,
            )}
            {...props}
          />
        </div>

        {/* label sits to the right and is linked via htmlFor */}
        {label && (
          <div className="ml-3 text-sm leading-6">
            <label htmlFor={checkboxId} className="font-medium text-neutral-700 cursor-pointer">
              {label}
            </label>
          </div>
        )}
      </div>
    )
    // endregion
  },
)

Checkbox.displayName = 'Checkbox'
// endregion
