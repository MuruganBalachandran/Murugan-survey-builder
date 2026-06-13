import { Button } from '@/components/ui/Button'
import { DragIcon, EditIcon, TrashIcon } from '@/utils/icons'
import { questionTypeLabel } from '@/utils/common/survey'
import type { SurveyQuestionsStepProps } from '@/types'

export const SurveyQuestionsStep = ({
  surveyTitle,
  surveyDescription,
  questions,
  isQuestionsLoading,
  isDraggingQuestionId,
  onAddQuestion,
  onEditQuestion,
  onDeleteQuestion,
  onQuestionDragStart,
  onQuestionDragOver,
  onQuestionDrop,
  onQuestionDragEnd,
}: SurveyQuestionsStepProps) => (
  <div className="space-y-6">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-600">Questions</p>
        <h3 className="mt-2 text-2xl font-bold text-gray-900">{surveyTitle}</h3>
        <p className="mt-2 text-sm text-gray-600">{surveyDescription || 'No description yet.'}</p>
      </div>
      <Button type="button" variant="primary" onClick={onAddQuestion}>
        Add question
      </Button>
    </div>

    {isQuestionsLoading ? (
      <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
        Loading questions...
      </div>
    ) : questions.length === 0 ? (
      <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
        No questions yet. Add the first one.
      </div>
    ) : (
      <div className="max-h-[46vh] space-y-3 overflow-y-auto pr-1">
        {questions.map((question, index) => (
          <div
            key={question.id}
            draggable
            onDragStart={() => onQuestionDragStart?.(question.id)}
            onDragOver={onQuestionDragOver}
            onDrop={() => onQuestionDrop?.(question.id)}
            onDragEnd={onQuestionDragEnd}
            className={`rounded-2xl border bg-gray-50 p-4 transition-all ${
              isDraggingQuestionId === question.id ? 'border-violet-500 opacity-50' : 'border-gray-200 hover:border-violet-300'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="pt-1 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600">
                  <DragIcon />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-violet-600 shadow-sm">
                      Q{index + 1}
                    </span>
                    <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-gray-600 shadow-sm">
                      {questionTypeLabel(question.type, question.uiType)}
                    </span>
                    {question.required && (
                      <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
                        Required
                      </span>
                    )}
                  </div>
                  <p className="mt-3 text-base font-semibold text-gray-900">{question.title}</p>
                  {question.description && <p className="mt-1 text-sm text-gray-600">{question.description}</p>}
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEditQuestion(question)}
                      className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white p-2 text-violet-600 transition-colors hover:bg-violet-50"
                      title="Edit question"
                      aria-label="Edit question"
                    >
                      <EditIcon />
                    </button>
                    <button
                      onClick={() => onDeleteQuestion(question)}
                      className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white p-2 text-red-600 transition-colors hover:bg-red-50"
                      title="Delete question"
                      aria-label="Delete question"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
)
