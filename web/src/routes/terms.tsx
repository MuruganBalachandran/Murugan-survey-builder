// region imports
import { createFileRoute } from '@tanstack/react-router'
import { TermsOfServicePage } from '@/pages/TermsOfService'
// endregion

// region route definition
// Public route — static terms of service page
export const Route = createFileRoute('/terms')({
  component: TermsOfServicePage,
})
// endregion
