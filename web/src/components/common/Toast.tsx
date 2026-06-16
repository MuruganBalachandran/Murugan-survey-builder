// region imports
import { useEffect, useState } from 'react'
import { subscribeToToasts, type ToastMessage, type ToastVariant, toast } from '@/lib/toast'
import { getToastVariantStyles } from '@/utils/common'
// endregion

// region ToastItem component
const ToastItem = ({ message }: { message: ToastMessage }) => {
  // region state
  const [isLeaving, setIsLeaving] = useState(false)
  // endregion

  const styles = getToastVariantStyles(message.variant)

  // region effects

  // start leave animation before the toast is fully removed
  useEffect(() => {
    if (message.duration === 0) return

    const leaveTimer = window.setTimeout(
      () => setIsLeaving(true),
      Math.max(0, message.duration - 200),
    )
    const removeTimer = window.setTimeout(() => toast.dismiss(message.id), message.duration)

    return () => {
      window.clearTimeout(leaveTimer)
      window.clearTimeout(removeTimer)
    }
  }, [message.duration, message.id])

  // endregion

  // region render
  return (
    <div
      role="status"
      aria-live={message.variant === 'error' ? 'assertive' : 'polite'}
      className={`relative w-full overflow-hidden rounded-2xl border border-white/80 bg-white/95 p-4 shadow-xl shadow-slate-900/10 backdrop-blur-xl transition-all duration-200 ${
        isLeaving ? 'translate-x-4 opacity-0' : 'translate-x-0 opacity-100'
      }`}
    >
      {/* left accent bar indicating variant */}
      <span className={`absolute inset-y-0 left-0 w-1 ${styles.accentClassName}`} />

      <div className="flex items-start gap-3">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base font-bold ${styles.iconClassName}`}
          aria-label={styles.description}
        >
          {styles.icon}
        </span>

        <div className="min-w-0 flex-1 pt-0.5">
          <p className="text-sm font-semibold text-gray-900">{message.title}</p>
          {message.description && (
            <p className="mt-1 text-sm leading-5 text-gray-600">{message.description}</p>
          )}
        </div>

        {/* manual dismiss button */}
        <button
          type="button"
          onClick={() => toast.dismiss(message.id)}
          className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          aria-label="Dismiss notification"
        >
          <span className="text-lg leading-none">×</span>
        </button>
      </div>
    </div>
  )
  // endregion
}
// endregion

// region ToastContainer component
export const ToastContainer = () => {
  // region state
  const [messages, setMessages] = useState<ToastMessage[]>([])
  // endregion

  // region effects
  // subscribe to the toast event bus on mount
  useEffect(() => subscribeToToasts(setMessages), [])
  // endregion

  // region render
  return (
    <div className="pointer-events-none fixed right-4 top-20 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3 sm:right-6">
      {messages.map((message) => (
        <div key={message.id} className="pointer-events-auto">
          <ToastItem message={message} />
        </div>
      ))}
    </div>
  )
  // endregion
}
// endregion
