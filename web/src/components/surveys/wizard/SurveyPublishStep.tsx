// region imports
import { Button } from "@/components/ui/Button";
import { useCountdown } from "@/hooks/useCountdown";
import type { SurveyPublishStepProps } from "@/types";
import { getSurveyUrl } from "@/utils/common/survey";
// endregion

// region helpers
const getNowLocal = () => {
  const now = new Date()
  now.setSeconds(0, 0)
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16)
}
// endregion

// region component
export const SurveyPublishStep = ({
  surveyTitle,
  surveySlug,
  isPublished,
  onCopyLink,
  onPreview,
  isPublishing,
  endsAt,
  onEndsAtChange,
}: SurveyPublishStepProps) => {
  const countdown = useCountdown(endsAt)

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-600">
          Publish & share
        </p>
        <h3 className="mt-2 text-2xl font-bold text-gray-900">{surveyTitle}</h3>
        <p className="mt-2 text-sm text-gray-600">
          Publish the survey and share the live link when you are ready.
        </p>

        {/* current publish status pill — reflects in-flight saving state */}
        <div className="mt-4 inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
          {isPublishing
            ? "Saving survey state"
            : isPublished
              ? "Published"
              : "Draft"}
        </div>

        {/* response limit end date/time */}
        <div className="mt-5">
          <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
            Response limit end date / time
          </label>
          <input
            type="datetime-local"
            value={endsAt ? endsAt.slice(0, 16) : ""}
            min={getNowLocal()}
            onChange={(e) => {
              if (!e.target.value) { onEndsAtChange?.(""); return }
              const picked = new Date(e.target.value)
              if (picked <= new Date()) return
              onEndsAtChange?.(picked.toISOString())
            }}
            className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
          />
          {countdown && (
            <p
              className={`mt-1.5 text-xs font-medium ${
                countdown === "Ended" ? "text-red-500" : "text-violet-600"
              }`}
            >
              {countdown}
            </p>
          )}
        </div>

        {/* public URL — only available once the survey has a slug */}
        <div className="mt-5 rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Public link
          </p>
          <p className="mt-2 break-all text-sm font-medium text-gray-900">
            {surveySlug
              ? getSurveyUrl(surveySlug)
              : "Create questions to generate the public link."}
          </p>
        </div>

        {/* copy and preview actions — disabled until the survey is published */}
        <div className="mt-5 flex flex-wrap gap-3">
          <Button
            variant="secondary"
            onClick={onCopyLink}
            disabled={!surveySlug || !isPublished}
          >
            Copy share link
          </Button>
          <Button
            variant="tertiary"
            onClick={onPreview}
            disabled={!surveySlug || !isPublished}
          >
            Preview
          </Button>
        </div>
      </div>
    </div>
  );
};
// endregion
