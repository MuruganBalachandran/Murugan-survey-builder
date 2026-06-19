// region imports
import { forwardRef } from "react";
import { cn } from "@/utils/common";
import type { InputProps } from "@/types";
// endregion

// region component
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, suffix, className, id, ...props }, ref) => {
    // fall back to name as the id so label htmlFor always links correctly
    const inputId = id || props.name;

    // region render
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-2 block text-xs font-medium text-gray-600 uppercase tracking-wide"
          >
            {label}
            {props.required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {/* optional leading icon */}
          {icon && (
            <div className="pointer-events-none absolute left-3 flex items-center text-gray-400">
              {icon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full rounded-lg border bg-white px-4 py-2.5 text-sm font-normal text-gray-900",
              "border-gray-200 placeholder-gray-400 transition-all duration-200",
              "hover:border-gray-300",
              "focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100",
              "disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed disabled:border-gray-200",
              error && "border-red-500 focus:ring-red-100 focus:border-red-500",
              icon && "pl-10",
              suffix && "pr-10",
              className,
            )}
            onFocus={(e) => props.onFocus?.(e)}
            onBlur={(e) => props.onBlur?.(e)}
            {...props}
          />

          {/* optional trailing suffix (e.g. unit label or icon) */}
          {suffix && (
            <div className="absolute right-3 flex items-center text-gray-400">
              {suffix}
            </div>
          )}
        </div>

        {/* error takes priority over hint */}
        {error && (
          <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>
        )}
        {hint && !error && (
          <p className="mt-1.5 text-xs text-gray-500">{hint}</p>
        )}
      </div>
    );
    // endregion
  },
);

Input.displayName = "Input";
// endregion
