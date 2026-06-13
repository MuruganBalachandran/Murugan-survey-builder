import { createFileRoute } from '@tanstack/react-router'
import { SurveysPage } from '@/pages/Surveys'

export const Route = createFileRoute('/surveys')({
  component: SurveysPage,
})
