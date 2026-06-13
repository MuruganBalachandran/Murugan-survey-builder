import { useEffect } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useAppSelector } from '@/hooks/redux'
import { LoginForm } from '@/components/auth/LoginForm'

export const LoginPage = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAppSelector((state) => state.auth)

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: '/dashboard' })
    }
  }, [isAuthenticated, navigate])

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-white/50 bg-white p-7 shadow-2xl shadow-indigo-950/25">
        <div className="text-center mb-10">
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-blue-500 text-lg font-bold text-white shadow-lg shadow-violet-200">
            S
          </div>
          <p className="app-eyebrow">SurveyBuilder</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">Welcome back</h1>
          <p className="mt-2 text-sm text-gray-500">Sign in to manage surveys and responses.</p>
        </div>

        <LoginForm />

        <p className="text-center text-sm mt-6 text-gray-500">
          Don't have an account?{' '}
          <Link
            to="/signup"
            className="font-medium text-violet-600 hover:text-violet-700 transition-colors"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
