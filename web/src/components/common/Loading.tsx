// region imports
import { cn } from '@/lib/cn'
import type { LoadingProps } from '@/types'
import { SIZE_CLASSES, LOADING_TEXT, LOADING_DEFAULT_SIZE } from '@/utils/constants'
// endregion

// region component
export const Loading = ({
  size = LOADING_DEFAULT_SIZE,
  text = LOADING_TEXT,
  fullScreen = false,
}: LoadingProps) => {
  const sizeClass = SIZE_CLASSES.LOADING[size as keyof typeof SIZE_CLASSES.LOADING]

  // region render

  // spinner + optional label, shared between inline and full-screen modes
  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={cn('animate-spin rounded-full border-sky-200', 'border-t-sky-500', sizeClass)} />
      {text && <p className="text-sm text-neutral-600">{text}</p>}
    </div>
  )

  // full-screen mode overlays the entire viewport with a blur backdrop
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm">
        {content}
      </div>
    )
  }

  return content
  // endregion
}
// endregion
