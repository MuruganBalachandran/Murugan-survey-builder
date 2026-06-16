// region imports
import { Button } from '@/components/ui/Button'
import type { FinalCtaSectionProps } from '@/types'
// endregion

// region component
export const FinalCtaSection = ({ onGetStarted }: FinalCtaSectionProps) => (
  // bottom-of-page call-to-action section with the hero gradient background
  <section className="app-hero text-center">
    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-100">
      Ready when you are
    </p>
    <h2 className="mt-3 text-3xl font-bold text-white">Ready to create your first survey?</h2>
    <p className="mx-auto mt-3 max-w-2xl text-violet-100">
      Start with a clean builder, publish a public link, and collect responses in one workspace.
    </p>
    <Button
      variant="secondary"
      size="lg"
      className="mt-6"
      onClick={onGetStarted}
      className="bg-white !text-indigo-600 !border-none"
    >
      Get Started
    </Button>
  </section>
)
// endregion
