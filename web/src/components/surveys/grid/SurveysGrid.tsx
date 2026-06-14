// region imports
import { SurveyCard } from './SurveyCard'
import type { SurveysGridProps } from '@/types'
// endregion

// region component
export const SurveysGrid = ({ surveys, onEdit, onPreview, onShare, onDelete }: SurveysGridProps) => (
  // responsive 1 → 2 → 3 column grid of survey cards
  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
    {surveys.map((survey) => (
      <SurveyCard
        key={survey.id}
        survey={survey}
        onEdit={onEdit}
        onPreview={onPreview}
        onShare={onShare}
        onDelete={onDelete}
      />
    ))}
  </div>
)
// endregion
