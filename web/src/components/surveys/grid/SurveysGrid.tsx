// region imports

import type { SurveysGridProps } from "@/types";
import { SurveyCard } from "./SurveyCard";
// endregion

// region component
export const SurveysGrid = ({
  surveys,
  onEdit,
  onPreview,
  onShare,
  onDelete,
  onManualClose,
  onAutoExpire,
}: SurveysGridProps) => (
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
        onManualClose={onManualClose}
        onAutoExpire={onAutoExpire}
      />
    ))}
  </div>
);
// endregion
