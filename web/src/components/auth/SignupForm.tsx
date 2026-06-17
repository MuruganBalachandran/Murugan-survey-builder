// region Imports

import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { toast } from '@/lib/toast'
import { clearError, signupUser } from '@/store/slices/authSlice'
import type { FieldErrors, PasswordValidation, SignupFormData, SignupFormProps } from '@/types'
import { isPasswordValid, PASSWORD_RULES, validatePasswordRules } from '@/utils/common'
import { AUTH_ERROR_MESSAGES } from '@/utils/constants'
import { CheckIcon, EyeIcon, EyeOffIcon, LockIcon, MailIcon, UserIcon, XIcon } from '@/utils/icons'

// endregion

// region Component: SignupForm

export const SignupForm = ({ onSuccess }: SignupFormProps) => {
  // region State Management
  const dispatch = useAppDispatch()
  const { isLoading } = useAppSelector((state) => state.auth)

  const [formData, setFormData] = useState<SignupFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    terms: false,
  })

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordValidation, setPasswordValidation] = useState<PasswordValidation>({
    minLength: false,
    hasLowercase: false,
    hasUppercase: false,
    hasSpecial: false,
  })

  // endregion

  // region Helpers

  const getPasswordError = (value: string): string | null => {
    if (!value) return AUTH_ERROR_MESSAGES.PASSWORD_REQUIRED
    const validation = validatePasswordRules(value)
    if (!validation.minLength) return AUTH_ERROR_MESSAGES.PASSWORD_MIN_LENGTH
    if (!validation.hasLowercase) return AUTH_ERROR_MESSAGES.PASSWORD_LOWERCASE
    if (!validation.hasUppercase) return AUTH_ERROR_MESSAGES.PASSWORD_UPPERCASE
    if (!validation.hasSpecial) return AUTH_ERROR_MESSAGES.PASSWORD_SPECIAL
    return null
  }

  // endregion

  // region Event Handlers

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))

    if (name === 'password') {
      setPasswordValidation(validatePasswordRules(value))
    }

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const newErrors: FieldErrors = {}

    if (name === 'name') {
      if (!value) newErrors.name = AUTH_ERROR_MESSAGES.NAME_REQUIRED
      else if (value.length < 2) newErrors.name = AUTH_ERROR_MESSAGES.NAME_MIN_LENGTH
    }

    if (name === 'email') {
      if (!value) newErrors.email = AUTH_ERROR_MESSAGES.EMAIL_REQUIRED
      else if (!value.includes('@')) newErrors.email = AUTH_ERROR_MESSAGES.EMAIL_INVALID
    }

    if (name === 'password') {
      const err = getPasswordError(value)
      if (err) newErrors.password = err
    }

    if (name === 'confirmPassword') {
      if (!value) newErrors.confirmPassword = AUTH_ERROR_MESSAGES.CONFIRM_PASSWORD_REQUIRED
      else if (value !== formData.password) newErrors.confirmPassword = AUTH_ERROR_MESSAGES.CONFIRM_PASSWORD_MISMATCH
    }

    setFieldErrors((prev) => ({ ...prev, ...newErrors }))
  }

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()

    const newErrors: FieldErrors = {}

    if (!formData.name) newErrors.name = AUTH_ERROR_MESSAGES.NAME_REQUIRED
    else if (formData.name.length < 2) newErrors.name = AUTH_ERROR_MESSAGES.NAME_MIN_LENGTH

    if (!formData.email) newErrors.email = AUTH_ERROR_MESSAGES.EMAIL_REQUIRED
    else if (!formData.email.includes('@')) newErrors.email = AUTH_ERROR_MESSAGES.EMAIL_INVALID

    const passwordErr = getPasswordError(formData.password)
    if (passwordErr) newErrors.password = passwordErr

    if (!formData.confirmPassword) newErrors.confirmPassword = AUTH_ERROR_MESSAGES.CONFIRM_PASSWORD_REQUIRED
    else if (formData.confirmPassword !== formData.password) newErrors.confirmPassword = AUTH_ERROR_MESSAGES.CONFIRM_PASSWORD_MISMATCH

    if (!formData.terms) newErrors.terms = AUTH_ERROR_MESSAGES.TERMS_REQUIRED

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors)
      return
    }

    dispatch(clearError())
    const result = await dispatch(
      signupUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      }),
    )

    if (result.meta.requestStatus === 'fulfilled') {
      toast.success('Account created successfully!')
      setFormData({ name: '', email: '', password: '', confirmPassword: '', terms: false })
      setFieldErrors({})
      onSuccess?.()
    } else if (result.meta.requestStatus === 'rejected' && result.payload) {
      const payload = result.payload as Record<string, string>
      toast.error(payload.general || payload.email || payload.password || 'Signup failed')
    }
  }

  // endregion

  // region UI Render

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Full Name"
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="John Doe"
        required
        error={fieldErrors.name}
        icon={<UserIcon />}
      />

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

      <div>
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
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className={`flex items-center transition-colors duration-150 ${showPassword ? 'text-violet-400' : 'text-gray-600'
                }`}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          }
        />

        {formData.password && (
          <div className="mt-2.5 rounded-lg border border-gray-200 bg-gray-50 p-3 grid grid-cols-2 gap-1.5">
            {PASSWORD_RULES.map(({ key, label }) => {
              const passed = passwordValidation[key]
              return (
                <div key={key} className="flex items-center gap-1.5">
                  <span
                    className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full transition-all duration-200 ${passed ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-200 text-gray-500'
                      }`}
                  >
                    {passed ? <CheckIcon /> : <XIcon />}
                  </span>
                  <span
                    className={`text-xs transition-colors duration-200 ${passed ? 'text-emerald-600' : 'text-gray-500'
                      }`}
                  >
                    {label}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <Input
        label="Confirm Password"
        type={showConfirmPassword ? 'text' : 'password'}
        name="confirmPassword"
        value={formData.confirmPassword}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="••••••••"
        required
        error={fieldErrors.confirmPassword}
        icon={<LockIcon />}
        suffix={
          <button
            type="button"
            onClick={() => setShowConfirmPassword((v) => !v)}
            tabIndex={-1}
            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            className={`flex items-center transition-colors duration-150 ${showConfirmPassword ? 'text-violet-400' : 'text-gray-600'
              }`}
          >
            {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        }
      />

      <div>
        <div className="flex items-start gap-2.5">
          <div className="relative flex-shrink-0 pt-0.5">
            <input
              type="checkbox"
              name="terms"
              id="terms"
              checked={formData.terms}
              onChange={handleChange}
              className="absolute h-4.5 w-4.5 cursor-pointer opacity-0"
            />
            <div
              className={`flex h-4.5 w-4.5 items-center justify-center rounded border transition-all duration-150 ${formData.terms ? 'border-violet-500 bg-violet-100' : 'border-gray-300 bg-white'
                }`}
            >
              {formData.terms && <CheckIcon />}
            </div>
          </div>

          <label
            htmlFor="terms"
            className="cursor-pointer select-none text-xs leading-normal text-gray-600"
          >
            I agree to the{' '}
            <Link to="/terms" className="font-medium text-violet-600 hover:text-violet-700">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="font-medium text-violet-600 hover:text-violet-700">
              Privacy Policy
            </Link>
          </label>
        </div>

        {fieldErrors.terms && (
          <p className="mt-1.5 text-xs font-medium text-red-600">{fieldErrors.terms}</p>
        )}
      </div>

      <Button
        type="submit"
        fullWidth
        isLoading={isLoading}
        disabled={!isPasswordValid(passwordValidation)}
        className="mt-1"
      >
        Create Account
      </Button>
    </form>
  )

  // endregion
}
