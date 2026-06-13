import type { Survey } from '@/services/api/surveys'
import { SurveyCard } from './SurveyCard'
import type { SurveysGridProps } from '@/types'

export const SurveysGrid = ({
  surveys,
  onEdit,
  onPreview,
  onShare,
  onDelete,
}: SurveysGridProps) => {
  return (
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
}
