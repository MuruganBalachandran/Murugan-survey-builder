// region imports
import { Button } from '@/components/ui/Button'
import { getSurveyUrl } from '@/utils/common/survey'
import type { SurveyPublishStepProps } from '@/types'
// endregion

// region component
export const SurveyPublishStep = ({
  surveyTitle,
  surveySlug,
  isPublished,
  onCopyLink,
  onPreview,
  isPublishing,
}: SurveyPublishStepProps) => (
  <div className="space-y-6">
    <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-600">Publish & share</p>
      <h3 className="mt-2 text-2xl font-bold text-gray-900">{surveyTitle}</h3>
      <p className="mt-2 text-sm text-gray-600">
        Publish the survey and share the live link when you are ready.
      </p>

      {/* current publish status pill — reflects in-flight saving state */}
      <div className="mt-4 inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
        {isPublishing ? 'Saving survey state' : isPublished ? 'Published' : 'Draft'}
      </div>

      {/* public URL — only available once the survey has a slug */}
      <div className="mt-5 rounded-2xl border border-gray-200 bg-gray-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Public link</p>
        <p className="mt-2 break-all text-sm font-medium text-gray-900">
          {surveySlug ? getSurveyUrl(surveySlug) : 'Create questions to generate the public link.'}
        </p>
      </div>

      {/* copy and preview actions — disabled until the survey is published */}
      <div className="mt-5 flex flex-wrap gap-3">
        <Button variant="secondary" onClick={onCopyLink} disabled={!surveySlug || !isPublished}>
          Copy share link
        </Button>
        <Button variant="tertiary" onClick={onPreview} disabled={!surveySlug || !isPublished}>
          Preview
        </Button>
      </div>
    </div>
  </div>
)
// endregion
