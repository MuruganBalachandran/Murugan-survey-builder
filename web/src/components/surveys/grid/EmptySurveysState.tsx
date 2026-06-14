// region imports
import { Button } from '@/components/ui/Button'
import { PlusIcon, NavSurveyIcon } from '@/utils/icons'
import type { EmptySurveysStateProps } from '@/types'
// endregion

// region component
export const EmptySurveysState = ({ onCreateClick }: EmptySurveysStateProps) => (
  // shown when the user has no surveys yet
  <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
    <div className="mb-4">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-violet-100">
        <NavSurveyIcon />
      </div>
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">No surveys yet</h3>
    <p className="text-gray-600 mb-6">Create your first survey to get started</p>
    <Button onClick={onCreateClick} variant="primary" icon={<PlusIcon />}>
      Create Survey
    </Button>
  </div>
)
// endregion
