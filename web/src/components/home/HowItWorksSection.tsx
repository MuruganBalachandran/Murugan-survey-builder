// region imports
import { HOW_IT_WORKS_STEPS } from '@/utils/constants'
// endregion

// region component
export const HowItWorksSection = () => (
  <section id="how-it-works" className="app-panel-muted">
    <div className="text-center">
      <p className="app-eyebrow">How it works</p>
      <h2 className="app-title mt-2">Create, share, collect</h2>
    </div>

    {/* numbered step cards */}
    <div className="mt-8 grid gap-4 md:grid-cols-3">
      {HOW_IT_WORKS_STEPS.map(([step, title, description]) => (
        <div key={step} className="rounded-2xl border border-white/80 bg-white p-5 shadow-sm">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-blue-500 text-lg font-bold text-white">
            {step}
          </span>
          <h3 className="mt-5 text-lg font-bold text-gray-900">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-gray-600">{description}</p>
        </div>
      ))}
    </div>
  </section>
)
// endregion
