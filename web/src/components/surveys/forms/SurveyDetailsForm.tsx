// region imports
import { Input } from '@/components/ui/Input'
import type { SurveyDetailsFormProps } from '@/types'
// endregion

// region component
export const SurveyDetailsForm = ({
  title,
  description,
  onTitleChange,
  onDescriptionChange,
}: SurveyDetailsFormProps) => (
  <div className="space-y-4">
    <Input
      label="Survey Title"
      type="text"
      value={title}
      onChange={(e) => onTitleChange(e.target.value)}
      placeholder="My Survey"
    />

    {/* description is optional — no required marker */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Description (optional)</label>
      <textarea
        value={description}
        onChange={(e) => onDescriptionChange(e.target.value)}
        placeholder="Describe your survey"
        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
        rows={4}
      />
    </div>
  </div>
)
// endregion
