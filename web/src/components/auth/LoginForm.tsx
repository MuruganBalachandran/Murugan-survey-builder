// region Imports
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { toast } from '@/lib/toast'
import { clearError, loginUser } from '@/store/slices/authSlice'
import type { FieldErrors, LoginFormData, LoginFormProps } from '@/types'
import { AUTH_ERROR_MESSAGES } from '@/utils/constants'
import { EyeIcon, EyeOffIcon, LockIcon, MailIcon } from '@/utils/icons'
// endregion

// region Component: LoginForm
export const LoginForm = ({ onSuccess }: LoginFormProps) => {
  // State Management
  const dispatch = useAppDispatch()
  const { isLoading } = useAppSelector((state) => state.auth)

  const [formData, setFormData] = useState<LoginFormData>({ email: '', password: '' })
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [showPassword, setShowPassword] = useState(false)


  // region Event Handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const newErrors: FieldErrors = {}

    if (name === 'email') {
      if (!value) newErrors.email = AUTH_ERROR_MESSAGES.EMAIL_REQUIRED
      else if (!value.includes('@')) newErrors.email = AUTH_ERROR_MESSAGES.EMAIL_INVALID
    }
    if (name === 'password') {
      if (!value) newErrors.password = AUTH_ERROR_MESSAGES.PASSWORD_REQUIRED
    }

    setFieldErrors((prev) => ({ ...prev, ...newErrors }))
  }

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()

    const newErrors: FieldErrors = {}
    if (!formData.email) newErrors.email = AUTH_ERROR_MESSAGES.EMAIL_REQUIRED
    else if (!formData.email.includes('@')) newErrors.email = AUTH_ERROR_MESSAGES.EMAIL_INVALID
    if (!formData.password) newErrors.password = AUTH_ERROR_MESSAGES.PASSWORD_REQUIRED

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors)
      return
    }

    dispatch(clearError())
    const result = await dispatch(loginUser(formData))

    if (result.meta.requestStatus === 'fulfilled') {
      toast.success('Login successful!')
      setFormData({ email: '', password: '' })
      setFieldErrors({})
      onSuccess?.()
    } else if (result.meta.requestStatus === 'rejected' && result.payload) {
      const payload = result.payload as Record<string, string>
      const errorMessage = payload.general || payload.email || payload.password
      toast.error(errorMessage || 'Login failed')
    }
  }

  // endregion

  // region UI Render

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Email"
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="you@example.com"
        required
        error={fieldErrors.email}
        icon={<MailIcon />}
      />

      <Input
        label="Password"
        type={showPassword ? 'text' : 'password'}
        name="password"
        value={formData.password}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="••••••••"
        required
        error={fieldErrors.password}
        icon={<LockIcon />}
        suffix={
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className={`flex items-center transition-colors duration-150 ${showPassword ? 'text-violet-400' : 'text-gray-600'
              }`}
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        }
      />

      <Button type="submit" fullWidth isLoading={isLoading} className="mt-2">
        Sign In
      </Button>
    </form>
  )
  // endregion
}
