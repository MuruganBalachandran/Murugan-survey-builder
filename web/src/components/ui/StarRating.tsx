// region types
interface StarRatingProps {
  value: number
  max?: number
  color?: string
  size?: number
  interactive?: boolean
  onChange?: (value: number) => void
}
// endregion

// region component
export const StarRating = ({
  value,
  max = 5,
  color = '#6366f1',
  size = 28,
  interactive = false,
  onChange,
}: StarRatingProps) => (
  <div className="flex items-center gap-1">
    {Array.from({ length: max }, (_, i) => {
      const filled = i + 1 <= value
      return (
        <button
          key={i}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onChange?.(i + 1)}
          className={`transition-transform ${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
          aria-label={`${i + 1} star${i + 1 === 1 ? '' : 's'}`}
        >
          <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill={filled ? color : 'none'}
            stroke={filled ? color : '#d1d5db'}
            strokeWidth="1.5"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </button>
      )
    })}
  </div>
)
// endregion
