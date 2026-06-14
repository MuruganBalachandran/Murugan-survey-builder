// region imports
import { createFileRoute } from '@tanstack/react-router'
import { PrivacyPolicyPage } from '@/pages/PrivacyPolicy'
// endregion

// region route definition
// Public route — static privacy policy page
export const Route = createFileRoute('/privacy')({
  component: PrivacyPolicyPage,
})
// endregion
