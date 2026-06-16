// region imports
import { useCallback, useState } from 'react'
import type { ModalVariant } from '@/types'

// endregion

// region types
interface ModalState {
  isOpen: boolean
  title: string
  description?: string
  variant?: ModalVariant
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void | Promise<void>
}
// endregion

// region hook
export const useModal = () => {
  const [state, setState] = useState<ModalState>({
    isOpen: false,
    title: '',
  })
  const [isLoading, setIsLoading] = useState(false)

  const openModal = useCallback(
    (config: {
      title: string
      description?: string
      variant?: ModalVariant
      confirmText?: string
      cancelText?: string
      onConfirm?: () => void | Promise<void>
    }) => {
      setState({
        isOpen: true,
        title: config.title,
        description: config.description,
        variant: config.variant,
        confirmText: config.confirmText,
        cancelText: config.cancelText,
        onConfirm: config.onConfirm,
      })
    },
    [],
  )

  const closeModal = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false }))
  }, [])

  const handleConfirm = useCallback(async () => {
    setIsLoading(true)
    try {
      if (state.onConfirm) {
        await state.onConfirm()
      }
      closeModal()
    } finally {
      setIsLoading(false)
    }
  }, [state, closeModal])

  // region return
  return {
    isOpen: state.isOpen,
    title: state.title,
    description: state.description,
    variant: state.variant,
    confirmText: state.confirmText,
    cancelText: state.cancelText,
    isLoading,
    openModal,
    closeModal,
    handleConfirm,
  }
  // endregion
}
// endregion
