// region imports
import { createFileRoute } from '@tanstack/react-router'
import { SurveysPage } from '@/pages/Surveys'
// endregion

// region route definition
// Protected route — lists all surveys owned by the authenticated user
export const Route = createFileRoute('/surveys')({
  component: SurveysPage,
})
// endregion
