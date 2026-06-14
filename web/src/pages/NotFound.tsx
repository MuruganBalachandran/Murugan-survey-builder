// region imports
import { Link } from '@tanstack/react-router'
import { AppLayout } from '@/components/Layout/AppLayout'
// endregion

// region component
export const NotFoundPage = () => (
  <AppLayout>
    <div className="app-page">
      <section className="app-panel flex min-h-[60vh] flex-col items-center justify-center text-center">
        <p className="app-eyebrow">404</p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">Page not found</h1>
        <p className="mt-3 max-w-lg text-sm leading-6 text-gray-600">
          The page you tried to open does not exist or has moved.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {/* go back one step in browser history */}
          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
          >
            Back
          </button>
          <Link
            to="/"
            className="inline-flex items-center rounded-full bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-700"
          >
            Go home
          </Link>
        </div>
      </section>
    </div>
  </AppLayout>
)
// endregion
