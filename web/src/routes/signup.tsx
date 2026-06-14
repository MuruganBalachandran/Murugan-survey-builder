// region imports
import { createFileRoute } from '@tanstack/react-router'
import { SignupPage } from '@/pages/Signup'
// endregion

// region route definition
// Public route — account registration page
export const Route = createFileRoute('/signup')({
  component: SignupPage,
})
// endregion
