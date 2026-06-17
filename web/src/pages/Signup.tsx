// region imports

import { Link, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { SignupForm } from '@/components/auth/SignupForm'
import { useAppSelector } from '@/hooks/redux'
// endregion

/**
 * SignupPage - Renders the signup form with authentication check
 * Redirects already-authenticated users to the dashboard
 */
// region component
export const SignupPage = () => {
  // region state
  const navigate = useNavigate()
  const { isAuthenticated } = useAppSelector((state) => state.auth)
  // endregion

  // region effects
  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: '/dashboard' })
    }
  }, [isAuthenticated, navigate])
  // endregion

  // region render
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-white/50 bg-white p-7 shadow-2xl shadow-indigo-950/25">
        <div className="text-center mb-8">
          {/* brand mark */}
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-blue-500 text-lg font-bold text-white shadow-lg shadow-violet-200">
            S
          </div>
          <p className="app-eyebrow">SurveyBuilder</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-gray-500">Start building polished surveys in minutes.</p>
        </div>

        <SignupForm />

        <p className="text-center text-sm mt-6 text-gray-500">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-violet-600 hover:text-violet-700 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
  // endregion
}
// endregion
