import { createFileRoute } from '@tanstack/react-router'
import { SurveyBuilderPage } from '@/pages/SurveyBuilder'

export const Route = createFileRoute('/surveys/$id/edit')({
  component: SurveyBuilderPage,
})
