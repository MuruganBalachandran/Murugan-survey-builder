import type { ResponsesSummaryProps } from '@/types'

export const ResponsesSummary = ({
  totalResponses,
  totalQuestions,
  responseRate = 0,
}: ResponsesSummaryProps) => {
  return (
    <div className="app-panel">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Summary</h2>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-gray-600 text-sm">Total Responses</p>
          <p className="text-3xl font-bold text-violet-600">{totalResponses}</p>
        </div>
        <div>
          <p className="text-gray-600 text-sm">Total Questions</p>
          <p className="text-3xl font-bold text-violet-600">{totalQuestions}</p>
        </div>
        <div>
          <p className="text-gray-600 text-sm">Response Rate</p>
          <p className="text-3xl font-bold text-violet-600">{responseRate}%</p>
        </div>
      </div>
    </div>
  )
}
