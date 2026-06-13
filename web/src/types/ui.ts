import type { ReactNode } from 'react'

// Button
export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger' | 'success'
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
  children: ReactNode
}

// Badge
export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info'
export type BadgeSize = 'sm' | 'md' | 'lg'

export interface BadgeProps {
  children: ReactNode
  variant?: BadgeVariant
  size?: BadgeSize
  className?: string
  icon?: ReactNode
}

// Card
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  hover?: boolean
  clickable?: boolean
  variant?: 'default' | 'outline' | 'elevated'
  className?: string
}

export interface CardHeaderProps {
  children: ReactNode
  className?: string
}

export interface CardBodyProps {
  children: ReactNode
  className?: string
}

export interface CardFooterProps {
  children: ReactNode
  className?: string
}

// Checkbox
export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode
  error?: string
}

// ColorPicker
export interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  label?: string
  className?: string
}

// Input
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  icon?: ReactNode
  suffix?: ReactNode
}

// Modal
export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  closeOnBackdropClick?: boolean
}

// RadioGroup
export interface RadioOption {
  value: string
  label: ReactNode
  description?: string
  disabled?: boolean
}

export interface RadioGroupProps {
  name: string
  options: RadioOption[]
  value?: string
  onChange?: (value: string) => void
  label?: string
  error?: string
  className?: string
  direction?: 'vertical' | 'horizontal'
}

// Select
export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  hint?: string
  options: SelectOption[]
  placeholder?: string
  icon?: ReactNode
}

// Textarea
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
  maxLength?: number
  showCharCount?: boolean
}
