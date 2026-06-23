// region imports
import type { AuthLayoutProps } from '@/types'
// endregion

// region AuthLayout component
export const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  // region UI
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-slate-950">
      <div className="w-full max-w-md relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-3/5 w-96 h-96 rounded-full bg-gradient-radial from-indigo-500/13 via-indigo-500/4 to-transparent pointer-events-none z-0" />

        <div className="text-center mb-8 relative z-10">
          <div className="flex items-center justify-center mb-6">
            <img src="/logo.png" alt="Qorvia" className="h-14 object-contain brightness-0 invert" />
          </div>

          <h2 className="text-3xl font-semibold text-slate-50 tracking-tight mb-2">{title}</h2>
          {subtitle && <p className="text-sm text-slate-400 tracking-wide">{subtitle}</p>}
        </div>

        <div className="relative z-10 bg-slate-900 border border-white/7 rounded-2xl p-8 shadow-2xl shadow-inset">
          {children}
        </div>

        <p className="text-center text-xs mt-6 text-slate-700 relative z-10">
          © 2024 Qorvia. All rights reserved.
        </p>
      </div>
    </div>
  )
  // endregion
}
