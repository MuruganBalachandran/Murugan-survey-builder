// region imports
import { createFileRoute } from '@tanstack/react-router'
import { HomePage } from '@/pages/Home'
// endregion

// region route definition
// Index route — renders the public marketing / landing page at "/"
export const Route = createFileRoute('/')({
  component: HomePage,
})
// endregion
