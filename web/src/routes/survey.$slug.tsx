import { createFileRoute } from '@tanstack/react-router'
import { PublicSurveyPage } from '@/pages/PublicSurvey'

export const Route = createFileRoute('/survey/$slug')({
  component: PublicSurveyPage,
})
