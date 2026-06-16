// region imports

import { FEATURES } from '@/utils/constants'
import { AnalyticsIcon, BuilderIcon, HomeSurveyIcon } from '@/utils/icons'

// endregion

// region constants
// map icon string keys from constants to actual React components
const iconMap: Record<string, React.ReactNode> = {
  BuilderIcon: <BuilderIcon />,
  AnalyticsIcon: <AnalyticsIcon />,
  HomeSurveyIcon: <HomeSurveyIcon />,
}
// endregion

// region component
export const FeaturesSection = () => (
  <section id="features" className="py-10">
    <div className="text-center">
      <p className="app-eyebrow">Features</p>
      <h2 className="app-title mt-2">Everything you need to collect better answers</h2>
    </div>

    {/* feature cards grid */}
    <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {FEATURES.map((feature) => (
        <div key={feature.title} className="app-panel">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
            {iconMap[feature.icon]}
          </div>
          <h3 className="mt-5 text-lg font-bold text-gray-900">{feature.title}</h3>
          <p className="mt-2 text-sm leading-6 text-gray-600">{feature.description}</p>
        </div>
      ))}
    </div>
  </section>
)
// endregion
