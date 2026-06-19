// region imports
import { forwardRef } from "react";
import { cn } from "@/utils/common";
import type { RadioGroupProps } from "@/types";
// endregion

// region component
export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(
  (
    {
      name,
      options,
      value,
      onChange,
      label,
      error,
      className,
      direction = "vertical",
    },
    ref,
  ) => (
    <div ref={ref} className="w-full">
      {label && (
        <label className="mb-3 block text-sm font-medium text-neutral-700">
          {label}
        </label>
      )}

      {/* stacked vertically by default, or inline when direction === 'horizontal' */}
      <div
        className={cn(
          "space-y-3",
          direction === "horizontal" && "space-y-0 flex gap-6",
        )}
      >
        {options.map((option) => (
          <label
            key={option.value}
            className={cn(
              "flex items-start cursor-pointer",
              direction === "horizontal" && "items-center",
            )}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange?.(e.target.value)}
              className={cn(
                "mt-1 h-4 w-4 border-neutral-300 bg-white text-sky-600",
                "border transition-all duration-200",
                "hover:border-neutral-400",
                "focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus:outline-none",
                "cursor-pointer",
                direction === "horizontal" && "mt-0",
              )}
            />
            <div className="ml-3">
              <div className="text-sm font-medium text-neutral-900">
                {option.label}
              </div>
              {/* optional description line beneath the label */}
              {option.description && (
                <div className="text-sm text-neutral-500">
                  {option.description}
                </div>
              )}
            </div>
          </label>
        ))}
      </div>

      {error && (
        <p className="mt-2 text-sm font-medium text-error-600">{error}</p>
      )}
    </div>
  ),
);

RadioGroup.displayName = "RadioGroup";
// endregion
