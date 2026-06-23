export default function QorviaIcon({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="qorvia" x1="0" y1="0" x2="64" y2="64">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>
      </defs>

      <circle cx="32" cy="32" r="24" stroke="url(#qorvia)" strokeWidth="6" />

      <path
        d="M22 32L29 39L43 24"
        stroke="url(#qorvia)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M42 42L50 50"
        stroke="url(#qorvia)"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  )
}
