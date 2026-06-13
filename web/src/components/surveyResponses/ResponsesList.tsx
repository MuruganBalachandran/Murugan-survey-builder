import type { SurveyResponse, Question, ResponsesListProps } from '@/types'

export const ResponsesList = ({
  responses,
  questions,
  isEmpty = false,
}: ResponsesListProps) => {
  return (
    <div className="app-panel">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">All Responses</h2>
      {isEmpty ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No responses yet. Share your survey to start collecting responses.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {responses.map((response, idx) => (
            <div key={response.id} className="rounded-xl border border-gray-200 p-4 transition-colors hover:border-violet-200 hover:bg-violet-50/50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-900">Response #{idx + 1}</span>
                <span className="text-xs text-gray-500">{new Date(response.submittedAt).toLocaleString()}</span>
              </div>
              <div className="space-y-2">
                {response.answers.map((answer: any, ansIdx: number) => {
                  const question = questions.find((q) => q.id === answer.questionId)
                  return (
                    <div key={ansIdx} className="text-sm">
                      <p className="text-gray-600 font-medium">{question?.title}</p>
                      <p className="text-gray-900">
                        {Array.isArray(answer.value) ? answer.value.join(', ') : String(answer.value)}
                      </p>
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
