// region imports
import { Input } from '@/components/ui/Input'
import type { SurveyBasicsStepProps } from '@/types'
// endregion

// region component
export const SurveyBasicsStep = ({
  title,
  description,
  error,
  descriptionError,
  onTitleChange,
  onDescriptionChange,
  onTitleBlur,
  onDescriptionBlur,
}: SurveyBasicsStepProps) => (
  // region render
  <div className="space-y-5">
    {/* required title field — validated on blur and submit */}
    <Input
      label="Survey title"
      required
      value={title}
      onChange={(event) => onTitleChange(event.target.value)}
      onBlur={onTitleBlur}
      error={error}
      placeholder="Customer feedback"
    />

    {/* optional description — only validated if non-empty */}
    <div>
      <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-gray-600">
        Description
      </label>
      <textarea
        value={description}
        onChange={(event) => onDescriptionChange(event.target.value)}
        onBlur={onDescriptionBlur}
        rows={5}
        placeholder="Tell respondents what this survey is for"
        className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100"
      />
      {descriptionError && (
        <p className="mt-1.5 text-xs font-medium text-red-600">{descriptionError}</p>
      )}
    </div>
  </div>
  // endregion
)
// endregion
