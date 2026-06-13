import type { ReactNode } from 'react'

// Modal
export type ModalVariant = 'default' | 'danger' | 'warning' | 'success' | 'info'

export interface CustomModalProps {
  isOpen: boolean
  title: string
  description?: string
  variant?: ModalVariant
  onClose: () => void
  onConfirm: () => void | Promise<void>
  confirmText?: string
  cancelText?: string
  isLoading?: boolean
  children?: ReactNode
  icon?: ReactNode
}

export interface VariantStyles {
  iconBg: string
  iconColor: string
  confirmButtonClass: string
}

// EmptyState
export interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

// Loading
export type LoadingSize = 'sm' | 'md' | 'lg'

export interface LoadingProps {
  size?: LoadingSize
  text?: string
  fullScreen?: boolean
}

// OffCanvas
export type OffCanvasSize = 'sm' | 'md' | 'lg' | 'xl'

export interface OffCanvasProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  size?: OffCanvasSize
  zIndex?: number
}

// Toast
export type ToastVariant = 'success' | 'error' | 'warning' | 'info'

export interface ToastMessage {
  id: string
  title: string
  description?: string
  variant: ToastVariant
  duration: number
}

export interface VariantToastStyles {
  icon: string
  iconClassName: string
  accentClassName: string
  description: string
}

// Layout
export interface AppLayoutProps {
  children: ReactNode
}

// Home
export interface HomeHeroProps {
  isAuthenticated: boolean
  onPrimaryClick: () => void
  onSignInClick: () => void
}

export interface FinalCtaSectionProps {
  onGetStarted: () => void
}

// Locked Access
export interface LockedAccessPageProps {
  title?: string
  description?: string
  onUnlock?: () => void
}
