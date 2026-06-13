import { useEffect, useState } from 'react'
import { subscribeToToasts, toast, type ToastMessage, type ToastVariant } from '@/lib/toast'

const variantStyles: Record<
  ToastVariant,
  { icon: string; iconClassName: string; accentClassName: string; description: string }
> = {
  success: {
    icon: '✓',
    iconClassName: 'bg-emerald-100 text-emerald-700',
    accentClassName: 'bg-emerald-500',
    description: 'Success',
  },
  error: {
    icon: '×',
    iconClassName: 'bg-red-100 text-red-700',
    accentClassName: 'bg-red-500',
    description: 'Error',
  },
  warning: {
    icon: '!',
    iconClassName: 'bg-amber-100 text-amber-700',
    accentClassName: 'bg-amber-500',
    description: 'Warning',
  },
  info: {
    icon: 'i',
    iconClassName: 'bg-violet-100 text-violet-700',
    accentClassName: 'bg-gradient-to-r from-violet-600 to-blue-500',
    description: 'Information',
  },
}

const ToastItem = ({ message }: { message: ToastMessage }) => {
  const [isLeaving, setIsLeaving] = useState(false)
  const styles = variantStyles[message.variant]

  useEffect(() => {
    if (message.duration === 0) return

    const leaveTimer = window.setTimeout(() => setIsLeaving(true), Math.max(0, message.duration - 200))
    const removeTimer = window.setTimeout(() => toast.dismiss(message.id), message.duration)

    return () => {
      window.clearTimeout(leaveTimer)
      window.clearTimeout(removeTimer)
    }
  }, [message.duration, message.id])

  return (
    <div
      role="status"
      aria-live={message.variant === 'error' ? 'assertive' : 'polite'}
      className={`relative w-full overflow-hidden rounded-2xl border border-white/80 bg-white/95 p-4 shadow-xl shadow-slate-900/10 backdrop-blur-xl transition-all duration-200 ${
        isLeaving ? 'translate-x-4 opacity-0' : 'translate-x-0 opacity-100'
      }`}
    >
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
          {message.description && <p className="mt-1 text-sm leading-5 text-gray-600">{message.description}</p>}
        </div>
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
}

export const ToastContainer = () => {
  const [messages, setMessages] = useState<ToastMessage[]>([])

  useEffect(() => subscribeToToasts(setMessages), [])

  return (
    <div className="pointer-events-none fixed right-4 top-20 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3 sm:right-6">
      {messages.map((message) => (
        <div key={message.id} className="pointer-events-auto">
          <ToastItem message={message} />
        </div>
      ))}
    </div>
  )
}
