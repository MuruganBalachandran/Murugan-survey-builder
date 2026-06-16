// region imports
import type { SurveyTemplatesStepProps } from "@/types";
import { SURVEY_TEMPLATES } from "@/utils/constants";
// endregion

// region component
export const SurveyTemplatesStep = ({
  onSelect,
  onBlank,
}: SurveyTemplatesStepProps) => (
  // region render
  <div className="space-y-5">
    {/* start blank option */}
    <button
      type="button"
      onClick={onBlank}
      className="w-full rounded-2xl border-2 border-dashed border-gray-200 px-5 py-4 text-left transition-colors hover:border-violet-400 hover:bg-violet-50/50"
    >
      <p className="text-sm font-semibold text-gray-900">Start blank</p>
      <p className="mt-0.5 text-xs text-gray-500">
        Build your survey from scratch.
      </p>
    </button>

    {/* template cards */}
    <div className="grid gap-3 sm:grid-cols-2">
      {SURVEY_TEMPLATES.map((template) => (
        <button
          key={template.id}
          type="button"
          onClick={() => onSelect(template.id)}
          className="rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm transition-all hover:border-violet-400 hover:shadow-md"
        >
          {/* color accent bar */}
          <div
            className="mb-3 h-1.5 w-10 rounded-full"
            style={{ backgroundColor: template.primaryColor }}
          />
          <p className="text-sm font-semibold text-gray-900">
            {template.label}
          </p>
          <p className="mt-1 text-xs text-gray-500">{template.description}</p>
          <p className="mt-3 text-xs font-medium text-gray-400">
            {template.questions.length} questions
          </p>
        </button>
      ))}
    </div>
  </div>
  // endregion
);
// endregion
