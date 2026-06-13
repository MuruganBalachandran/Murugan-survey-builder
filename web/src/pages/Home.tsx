import { useNavigate } from '@tanstack/react-router'
import { AppLayout } from '@/components/Layout/AppLayout'
import { FaqSection } from '@/components/home/FaqSection'
import { FeaturesSection } from '@/components/home/FeaturesSection'
import { FinalCtaSection } from '@/components/home/FinalCtaSection'
import { HomeHero } from '@/components/home/HomeHero'
import { HowItWorksSection } from '@/components/home/HowItWorksSection'
import { useAppSelector } from '@/hooks/redux'

export const HomePage = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAppSelector((state) => state.auth)
  const primaryCta = isAuthenticated ? '/dashboard' : '/signup'

  const handleGetStarted = () => navigate({ to: primaryCta })
  const handleSignIn = () => navigate({ to: '/login' })

  return (
    <AppLayout>
      <main className="app-page">
        <HomeHero
          isAuthenticated={isAuthenticated}
          onPrimaryClick={handleGetStarted}
          onSignInClick={handleSignIn}
        />
        <FeaturesSection />
        <HowItWorksSection />
        <FaqSection />
        <FinalCtaSection onGetStarted={handleGetStarted} />
      </main>
    </AppLayout>
  )
}

