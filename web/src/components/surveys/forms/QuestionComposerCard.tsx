// region imports
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { questionTypeLabel, normalizeQuestionType } from '@/utils/common/survey'
import { QUESTION_TYPES } from '@/utils/constants'
import type { QuestionComposerProps, QuestionType } from '@/types'
// endregion

// region component
export const QuestionComposerCard = ({
  isOpen,
  mode,
  form,
  errors,
  isSaving,
  onClose,
  onSave,
  onChange,
}: QuestionComposerProps) => {
  // region state

  // two-step create flow: select type first, then configure
  const [composerStep, setComposerStep] = useState<'select' | 'configure'>(
    mode === 'create' ? 'select' : 'configure',
  )

  // endregion

  // region effects

  // reset step whenever the composer opens or mode changes
  useEffect(() => {
    if (!isOpen) {
      setComposerStep('select')
      return
    }
    setComposerStep(mode === 'create' ? 'select' : 'configure')
  }, [isOpen, mode])

  // endregion

  if (!isOpen) return null

  // region render
  return (
    <div className="mt-4 rounded-3xl border border-violet-200 bg-violet-50 p-5 shadow-sm">
      {/* composer header with close button */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-600">
            {mode === 'edit' ? 'Edit question' : 'Add question'}
          </p>
          <h5 className="mt-2 text-lg font-bold text-gray-900">
            {mode === 'edit'
              ? 'Update the question'
              : composerStep === 'select'
                ? 'Choose a question type'
                : 'Build a new question'}
          </h5>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg border border-violet-200 bg-white px-3 py-2 text-xs font-semibold text-violet-700 transition-colors hover:bg-violet-100"
        >
          Close
        </button>
      </div>

      {/* step 1 (create only) — pick a question type from the grid */}
      {mode === 'create' && composerStep === 'select' ? (
        <div className="mt-5 space-y-4 rounded-2xl border border-white/70 bg-white p-4">
          <p className="text-sm text-gray-600">Choose the question type you want to add.</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {QUESTION_TYPES.map((typeCard) => (
              <button
                key={typeCard.value}
                type="button"
                onClick={() => {
                  // set type + uiType then advance to configure step
                  onChange?.((current) => ({
                    ...current,
                    type: typeCard.value,
                    uiType: typeCard.uiType,
                    options: ['', ''],
                  }))
                  setComposerStep('configure')
                }}
                className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-violet-300 hover:bg-violet-50"
              >
                <p className="font-semibold text-gray-900">{typeCard.label}</p>
                <p className="mt-1 text-xs text-gray-500">{typeCard.description}</p>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* step 2 — configure the selected question */
        <div className="mt-5 space-y-4 rounded-2xl border border-white/70 bg-white p-4">
          {/* edit mode shows a type selector; create mode shows a read-only badge */}
          {mode === 'edit' ? (
            <Select
              label="Question type"
              required
              value={form?.type}
              onChange={(event) =>
                onChange?.((current) => ({
                  ...current,
                  ...normalizeQuestionType(event.target.value as QuestionType),
                }))
              }
              options={QUESTION_TYPES.map((card) => ({
                value: card.value,
                label: `${card.label} — ${card.description}`,
              }))}
            />
          ) : (
            <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Selected type</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">
                {questionTypeLabel(form?.type || 'short_text')}
              </p>
            </div>
          )}

          <Input
            label="Question title"
            required
            value={form?.title || ''}
            onChange={(event) => onChange?.((current) => ({ ...current, title: event.target.value }))}
            error={errors?.title}
            placeholder="How satisfied are you?"
          />

          {/* optional helper text shown below the question to respondents */}
          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-gray-600">
              Description
            </label>
            <textarea
              value={form?.description || ''}
              onChange={(event) => onChange?.((current) => ({ ...current, description: event.target.value }))}
              rows={3}
              placeholder="Add helper text for respondents"
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100"
            />
          </div>

          <label className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form?.required || false}
              onChange={(event) => onChange?.((current) => ({ ...current, required: event.target.checked }))}
              className="h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
            />
            Required question
          </label>

          {/* options list — only shown for choice-based question types */}
          {(form?.type === 'multiple_choice' || form?.type === 'checkbox_group' || form?.type === 'dropdown') && (
            <div>
              <div className="mb-3 flex items-center justify-between gap-4">
                <label className="block text-xs font-medium uppercase tracking-wide text-gray-600">
                  Options
                </label>
                <button
                  onClick={() => onChange?.((current) => ({ ...current, options: [...current.options, ''] }))}
                  className="text-sm font-semibold text-violet-600 transition-colors hover:text-violet-700"
                >
                  + Add option
                </button>
              </div>

              <div className="space-y-3">
                {(form?.options || []).map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={option}
                      onChange={(event) =>
                        onChange?.((current) => {
                          const nextOptions = [...current.options]
                          nextOptions[index] = event.target.value
                          return { ...current, options: nextOptions }
                        })
                      }
                      placeholder={`Option ${index + 1}`}
                    />
                    {/* keep minimum of 2 options */}
                    <button
                      type="button"
                      onClick={() =>
                        onChange?.((current) => ({
                          ...current,
                          options:
                            current.options.length > 2
                              ? current.options.filter((_, idx) => idx !== index)
                              : current.options,
                        }))
                      }
                      className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              {errors?.options && <p className="mt-2 text-sm font-medium text-red-600">{errors.options}</p>}
            </div>
          )}

          {/* live preview of the question as respondents will see it */}
          <div className="rounded-2xl border border-dashed border-violet-200 bg-violet-50/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-violet-600">Question preview</p>
            <p className="mt-2 font-semibold text-gray-900">{form?.title || 'Question title'}</p>
            {form?.description && <p className="mt-1 text-sm text-gray-600">{form.description}</p>}
          </div>
        </div>
      )}

      {/* footer actions — back only shown mid-create flow */}
      <div className="mt-5 flex gap-3">
        {mode === 'create' && composerStep === 'configure' && (
          <Button variant="tertiary" fullWidth onClick={() => setComposerStep('select')}>
            Back
          </Button>
        )}
        {(mode === 'edit' || composerStep === 'configure') && (
          <Button variant="primary" fullWidth onClick={onSave} isLoading={isSaving}>
            {mode === 'edit' ? 'Save question' : 'Add question'}
          </Button>
        )}
        <Button variant="tertiary" fullWidth onClick={onClose}>
          Cancel
        </Button>
      </div>
    </div>
  )
  // endregion
}
// endregion
