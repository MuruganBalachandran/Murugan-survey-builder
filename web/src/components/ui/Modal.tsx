// region imports
import { useEffect } from 'react'
import { cn } from '@/lib/cn'
import type { ModalProps } from '@/types'
import { SIZE_CLASSES } from '@/utils/constants'
// endregion

// region component
export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnBackdropClick = true,
}: ModalProps) => {
  // region effects

  // lock scroll and register Escape handler while the modal is open
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  // endregion

  if (!isOpen) return null

  // region render
  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center p-4">
      {/* backdrop — conditionally closes on click */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-200"
        onClick={() => closeOnBackdropClick && onClose()}
      />

      <div
        className={cn(
          'relative w-full bg-white rounded-2xl shadow-2xl',
          'max-h-[90vh] overflow-y-auto',
          'animate-in fade-in zoom-in-95 duration-200',
          SIZE_CLASSES.MODAL[size],
        )}
      >
        {/* optional title bar with close button */}
        {title && (
          <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
              aria-label="Close modal"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}

        <div className="px-6 py-6">{children}</div>

        {/* optional footer slot for action buttons */}
        {footer && (
          <div className="border-t border-neutral-200 px-6 py-4 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
  // endregion
}
// endregion
