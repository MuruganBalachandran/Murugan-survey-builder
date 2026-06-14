// region imports
import { createFileRoute } from '@tanstack/react-router'
import { PublicSurveyPage } from '@/pages/PublicSurvey'
// endregion

// region route definition
// Public route — respondent-facing survey form; no authentication required.
// $slug is the human-readable survey identifier resolved from the URL segment.
export const Route = createFileRoute('/survey/$slug')({
  component: PublicSurveyPage,
})
// endregion
