// region imports
import { createFileRoute } from '@tanstack/react-router'
import { SurveyResponsesPage } from '@/pages/SurveyResponses'
// endregion

// region route definition
// Protected route — shows all submitted responses for a specific survey.
// $id is the survey UUID resolved from the URL segment.
export const Route = createFileRoute('/surveys/$id/responses')({
  component: SurveyResponsesPage,
})
// endregion
