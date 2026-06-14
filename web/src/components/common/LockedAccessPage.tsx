// region imports
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/Button'
import { AppLayout } from '@/components/Layout/AppLayout'
import { LockAccessIcon } from '@/utils/icons'
// endregion

// region component
export const LockedAccessPage = () => {
  const navigate = useNavigate()

  // region render
  return (
    <AppLayout>
      <main className="app-page">
        <div className="relative min-h-[calc(100vh-10rem)] overflow-hidden rounded-[2rem] border border-white/70 bg-white/60 shadow-xl">

          {/* blurred dashboard preview shown behind the lock card */}
          <div className="pointer-events-none absolute inset-0 blur-sm opacity-90">
            <div className="grid h-full gap-6 p-6 lg:grid-cols-[1.3fr_0.7fr]">
              <section className="rounded-3xl bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-600 p-8 text-white">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-100">Workspace</p>
                <h1 className="mt-3 text-4xl font-bold">Survey analytics dashboard</h1>
                <p className="mt-3 max-w-xl text-violet-100">
                  Manage surveys, track responses, and continue drafts from one place.
                </p>
                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  {['Surveys', 'Responses', 'Published'].map((label, index) => (
                    <div key={label} className="rounded-2xl bg-white/15 p-4">
                      <p className="text-sm text-violet-100">{label}</p>
                      <p className="mt-2 text-3xl font-bold">{[12, 1284, 9][index]}</p>
                    </div>
                  ))}
                </div>
              </section>
              <section className="space-y-4">
                <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
                  <h2 className="text-xl font-bold text-gray-900">Top surveys</h2>
                  <div className="mt-5 space-y-4">
                    {['Customer Feedback', 'Workshop Survey', 'Employee Poll'].map((item, index) => (
                      <div key={item}>
                        <div className="flex justify-between text-sm">
                          <span className="font-semibold text-gray-800">{item}</span>
                          <span className="text-gray-500">{[124, 98, 72][index]} responses</span>
                        </div>
                        <div className="mt-2 h-2 rounded-full bg-violet-100">
                          <div className="h-2 rounded-full bg-violet-500" style={{ width: `${80 - index * 16}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
                  <h2 className="text-xl font-bold text-gray-900">Recent activity</h2>
                  <div className="mt-4 space-y-3 text-sm text-gray-600">
                    <p>Anonymous submitted "Customer Feedback"</p>
                    <p>Anonymous submitted "Workshop Survey"</p>
                  </div>
                </div>
              </section>
            </div>
          </div>

          <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]" />

          {/* centred lock card with sign-in / sign-up CTAs */}
          <div className="relative z-10 flex min-h-[calc(100vh-10rem)] items-center justify-center p-6">
            <div className="w-full max-w-md rounded-3xl border border-white/80 bg-white/95 p-7 text-center shadow-2xl shadow-violet-950/15 backdrop-blur-xl">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-blue-500 text-white shadow-lg shadow-violet-200">
                <LockAccessIcon />
              </div>
              <h1 className="mt-5 text-2xl font-bold text-gray-900">Sign in to access this page</h1>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                Dashboard and survey management are part of your private workspace. Public survey links still work without signing in.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Button variant="primary" onClick={() => navigate({ to: '/login' })}>
                  Sign In
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => navigate({ to: '/signup' })}
                  style={{ background: '#EEF2FF', color: '#4F46E5', border: 'none' }}
                >
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </AppLayout>
  )
  // endregion
}
// endregion
