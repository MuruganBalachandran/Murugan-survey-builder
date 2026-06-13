// region imports
import type { AuthLayoutProps } from '@/types'
// endregion

// region AuthLayout component
export const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  // region UI
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-slate-950">
      <div className="w-full max-w-md relative">
        {/* region Cinematic indigo glow bloom */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-3/5 w-96 h-96 rounded-full bg-gradient-radial from-indigo-500/13 via-indigo-500/4 to-transparent pointer-events-none z-0" />
        {/* endregion */}

        {/* region Header */}
        <div className="text-center mb-8 relative z-10">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-indigo-400 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/35">
              <span className="text-white font-bold text-sm tracking-tight">Q</span>
            </div>
            <h1 className="text-xl font-semibold text-slate-50 tracking-tight">SurveyBuilder</h1>
          </div>

          <h2 className="text-3xl font-semibold text-slate-50 tracking-tight mb-2">{title}</h2>
          {subtitle && <p className="text-sm text-slate-400 tracking-wide">{subtitle}</p>}
        </div>

        {/* region Card */}
        <div className="relative z-10 bg-slate-900 border border-white/7 rounded-2xl p-8 shadow-2xl shadow-inset">
          {children}
        </div>
        {/* endregion */}

        {/* region Footer */}
        <p className="text-center text-xs mt-6 text-slate-700 relative z-10">
          © 2024 SurveyBuilder. All rights reserved.
        </p>
        {/* endregion */}
      </div>
    </div>
  )
  // endregion
}