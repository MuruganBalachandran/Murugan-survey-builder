// region types
interface CharCounterProps {
  value: string
  max: number
  min?: number
}
// endregion

// region component
export const CharCounter = ({ value, max, min }: CharCounterProps) => {
  const len = value.length
  const remaining = max - len
  const isOver = len > max
  const isBelowMin = min !== undefined && len > 0 && len < min

  return (
    <p
      className={`mt-1 text-right text-xs font-medium ${
        isOver ? 'text-red-500' : isBelowMin ? 'text-amber-500' : 'text-gray-400'
      }`}
    >
      {isOver
        ? `${Math.abs(remaining)} over limit`
        : `${len} / ${max}`}
    </p>
  )
}
// endregion
