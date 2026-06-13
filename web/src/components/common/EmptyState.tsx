import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import type { EmptyStateProps } from '@/types'

export const EmptyState = ({ icon, title, description, action, className }: EmptyStateProps) => {
  return (
    <div
      className={cn('flex flex-col items-center justify-center py-16 px-4 text-center', className)}
    >
      {icon && <div className="mb-4 text-5xl opacity-20">{icon}</div>}

      <h3 className="text-lg font-semibold text-neutral-900 mb-2">{title}</h3>

      {description && <p className="text-sm text-neutral-500 mb-6 max-w-sm">{description}</p>}

      {action && <div>{action}</div>}
    </div>
  )
}
