import { createFileRoute } from '@tanstack/react-router'
import { SurveyResponsesPage } from '@/pages/SurveyResponses'

export const Route = createFileRoute('/surveys/$id/responses')({
  component: SurveyResponsesPage,
})
