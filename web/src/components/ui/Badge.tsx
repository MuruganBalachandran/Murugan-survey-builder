// region imports
import { cn } from "@/utils/common";
import type { BadgeProps } from "@/types";
import { BADGE_SIZES, BADGE_VARIANTS } from "@/utils/constants";
// endregion

// region component
export const Badge = ({
  children,
  variant = "default",
  size = "md",
  className,
  icon,
}: BadgeProps) => (
  // inline pill label — renders as a <span> so it can sit inside any text context
  <span
    className={cn(
      "inline-flex items-center gap-1.5 font-medium",
      BADGE_VARIANTS[variant],
      BADGE_SIZES[size],
      className,
    )}
  >
    {/* optional leading icon */}
    {icon}
    {children}
  </span>
);
// endregion
