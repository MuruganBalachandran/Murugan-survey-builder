import { createFileRoute } from '@tanstack/react-router'
import { TermsOfServicePage } from '@/pages/TermsOfService'

export const Route = createFileRoute('/terms')({
  component: TermsOfServicePage,
})