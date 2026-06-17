// region imports
import { AppLayout } from '@/components/Layout/AppLayout'
// endregion

/**
 * TermsOfServicePage - Displays the terms of service information
 */
// region component
export const TermsOfServicePage = () => (
  <AppLayout>
    <div className="app-page">
      <section className="app-panel space-y-6">
        {/* browser back navigation */}
        <button
          type="button"
          onClick={() => window.history.back()}
          className="inline-flex w-fit items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
        >
          Back
        </button>
        {/* region render */}
        <div>
          <p className="app-eyebrow">Legal</p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">Terms of Service</h1>
        </div>
        <div className="space-y-4 text-sm leading-7 text-gray-600">
          <p>SurveyBuilder is provided as a survey builder and response collection tool.</p>
          <p>
            You are responsible for the surveys you create, the links you share, and the content you
            collect.
          </p>
          <p>Do not use the service to collect unlawful, harmful, or misleading data.</p>
          <p>We may update these terms as the product evolves.</p>
        </div>
        {/* endregion */}
      </section>
    </div>
  </AppLayout>
)
// endregion
