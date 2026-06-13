import type { ReactNode } from 'react'
import { Header } from './Header'
import { Footer } from './Footer'
import type { AppLayoutProps } from '@/types'

export const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="flex min-h-screen flex-col bg-transparent">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
