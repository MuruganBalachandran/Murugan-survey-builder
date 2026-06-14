// region imports
import { createFileRoute } from '@tanstack/react-router'
import { DashboardPage } from '@/pages/Dashboard'
// endregion

// region route definition
// Protected route — main dashboard shown after login
export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
})
// endregion
