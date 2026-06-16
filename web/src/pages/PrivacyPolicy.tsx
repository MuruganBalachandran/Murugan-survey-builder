// region imports
import { AppLayout } from '@/components/Layout/AppLayout'
// endregion

// region component
export const PrivacyPolicyPage = () => (
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
        <div>
          <p className="app-eyebrow">Legal</p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">Privacy Policy</h1>
        </div>
        <div className="space-y-4 text-sm leading-7 text-gray-600">
          <p>
            SurveyBuilder stores account information, surveys, questions, branding choices, and
            submitted responses.
          </p>
          <p>
            We use this data to operate the app, present your dashboard, and render public survey
            pages.
          </p>
          <p>
            Responses are visible to survey owners and are not shared publicly unless you share the
            survey link.
          </p>
          <p>We do not sell your survey response data.</p>
        </div>
      </section>
    </div>
  </AppLayout>
)
// endregion
