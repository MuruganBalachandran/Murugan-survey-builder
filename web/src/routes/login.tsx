// region imports
import { createFileRoute } from '@tanstack/react-router'
import { LoginPage } from '@/pages/Login'
// endregion

// region route definition
// Public route — sign-in page; redirects authenticated users away in the page itself
export const Route = createFileRoute('/login')({
  component: LoginPage,
})
// endregion
