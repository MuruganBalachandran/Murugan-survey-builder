import { StarRating } from '@/components/ui/StarRating'
import type { Question, ResponsesListProps } from '@/types'

// region helpers

const formatAnswer = (value: any, question: Question | undefined) => {
  if (question?.type === 'rating') {
    const num = Number(value)
    return <StarRating value={isNaN(num) ? 0 : num} size={18} />
  }
  if (Array.isArray(value)) {
    return (
      <div className="flex flex-wrap gap-1.5">
        {value.map((v: string) => (
          <span
            key={v}
            className="rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-medium text-violet-700"
          >
            {v}
          </span>
        ))}
      </div>
    )
  }
  const str = String(value)
  if (!str || str === 'undefined') return <span className="text-gray-400 italic text-xs">No answer</span>
  return <span className="text-gray-900">{str}</span>
}

// endregion

// region component
export const ResponsesList = ({ responses, questions, isEmpty = false, totalCount = 0, onExportCSV, isExporting = false }: ResponsesListProps) => {
  return (
    <div className="app-panel">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          All Responses
          {!isEmpty && (
            <span className="ml-2 rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-semibold text-violet-600">
              {totalCount}
            </span>
          )}
        </h2>
        {!isEmpty && onExportCSV && (
          <button
            onClick={onExportCSV}
            disabled={isExporting}
            className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export CSV
              </>
            )}
          </button>
        )}
      </div>

      {isEmpty ? (
        <div className="text-center py-8">
          <p className="text-gray-600">
            No responses yet. Share your survey to start collecting responses.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {responses.map((response, idx) => (
            <div
              key={response.id}
              className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden"
            >
              {/* response header */}
              <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700">
                    {idx + 1}
                  </span>
                  <span className="text-sm font-semibold text-gray-700">Anonymous</span>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(response.submittedAt).toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              {/* answers grid */}
              <div className="divide-y divide-gray-100">
                {response.answers.map((answer, ansIdx) => {
                  const question = questions.find((q) => q.id === answer.questionId)
                  return (
                    <div key={ansIdx} className="px-5 py-3 flex flex-col gap-1">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        {question?.title ?? '(Deleted question)'}
                      </p>
                      <div className="text-sm">
                        {formatAnswer(answer.value, question)}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
// endregion
