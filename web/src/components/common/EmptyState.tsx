// region imports
import { cn } from '@/lib/cn'
import type { EmptyStateProps } from '@/types'
// endregion

// region component
export const EmptyState = ({ icon, title, description, action, className }: EmptyStateProps) => (
  <div className={cn('flex flex-col items-center justify-center py-16 px-4 text-center', className)}>
    {/* optional decorative icon */}
    {icon && <div className="mb-4 text-5xl opacity-20">{icon}</div>}

    <h3 className="text-lg font-semibold text-neutral-900 mb-2">{title}</h3>

    {description && <p className="text-sm text-neutral-500 mb-6 max-w-sm">{description}</p>}

    {/* optional CTA rendered as a slot */}
    {action && <div>{action}</div>}
  </div>
)
// endregion
