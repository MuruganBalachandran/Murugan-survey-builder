import type { ReactNode } from 'react'
import type { AppLayoutProps } from '@/types'
import { Footer } from './Footer'
import { Header } from './Header'

export const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="flex min-h-screen flex-col bg-transparent">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
