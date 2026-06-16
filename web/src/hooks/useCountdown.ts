// region imports
import { useEffect, useRef, useState } from 'react'
// endregion

// region helpers
const formatCountdown = (ms: number): string => {
  if (ms <= 0) return 'Ended'
  const totalSeconds = Math.floor(ms / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  if (days > 0) return `${days}d ${hours}h ${minutes}m remaining`
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s remaining`
  return `${minutes}m ${seconds}s remaining`
}
// endregion

// region hook
export const useCountdown = (endsAt?: string, onExpire?: () => void) => {
  const [countdown, setCountdown] = useState('')
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const expiredRef = useRef(false)

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    expiredRef.current = false
    if (!endsAt) { setCountdown(''); return }
    const tick = () => {
      const ms = new Date(endsAt).getTime() - Date.now()
      setCountdown(formatCountdown(ms))
      if (ms <= 0 && !expiredRef.current) {
        expiredRef.current = true
        onExpire?.()
      }
    }
    tick()
    intervalRef.current = setInterval(tick, 1000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [endsAt, onExpire])

  return countdown
}
// endregion
