// region imports
import type { ValidationError } from '../types'
import {
  MAX_OPTIONS,
  MIN_OPTIONS,
  NAME_MIN_LENGTH,
  PASSWORD_MIN_LENGTH,
  QUESTION_DESCRIPTION_MAX_LENGTH,
  QUESTION_TITLE_MAX_LENGTH,
  QUESTION_TITLE_MIN_LENGTH,
  REGEX_EMAIL,
  REGEX_HEX_COLOR,
  REGEX_LOGO_URL,
  REGEX_PASSWORD_LOWERCASE,
  REGEX_PASSWORD_SPECIAL,
  REGEX_PASSWORD_UPPERCASE,
  SURVEY_DESCRIPTION_MAX_LENGTH,
  SURVEY_DESCRIPTION_MIN_LENGTH,
  SURVEY_TITLE_MAX_LENGTH,
  SURVEY_TITLE_MIN_LENGTH,
  VALID_QUESTION_TYPES,
  VALID_SURVEY_STATUSES,
} from './constants'
// endregion

// region auth validations
export const validateEmail = (email: string): ValidationError | null => {
  if (!REGEX_EMAIL.test(email)) {
    return { field: 'email', message: 'Invalid email format' }
  }
  return null
}

export const validatePassword = (password: string): ValidationError | null => {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return { field: 'password', message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters long` }
  }
  if (!REGEX_PASSWORD_LOWERCASE.test(password)) {
    return { field: 'password', message: 'Password must contain at least one lowercase letter' }
  }
  if (!REGEX_PASSWORD_UPPERCASE.test(password)) {
    return { field: 'password', message: 'Password must contain at least one uppercase letter' }
  }
  if (!REGEX_PASSWORD_SPECIAL.test(password)) {
    return { field: 'password', message: 'Password must contain at least one special character' }
  }
  return null
}

export const validateName = (name: string): ValidationError | null => {
  if (name.trim().length < NAME_MIN_LENGTH) {
    return { field: 'name', message: `Name must be at least ${NAME_MIN_LENGTH} characters long` }
  }
  return null
}

export const validateSignup = (
  email: string,
  password: string,
  name: string,
): Record<string, string> => {
  const errors: Record<string, string> = {}
  const emailError = validateEmail(email)
  if (emailError) errors[emailError.field] = emailError.message
  const passwordError = validatePassword(password)
  if (passwordError) errors[passwordError.field] = passwordError.message
  const nameError = validateName(name)
  if (nameError) errors[nameError.field] = nameError.message
  return errors
}

export const validateLogin = (email: string, password: string): Record<string, string> => {
  const errors: Record<string, string> = {}
  const emailError = validateEmail(email)
  if (emailError) errors[emailError.field] = emailError.message
  if (!password || password.length === 0) errors.password = 'Password is required'
  return errors
}
// endregion

// region survey validations
export const validateSurveyTitle = (title: string): ValidationError | null => {
  const t = title.trim()
  if (t.length === 0) return { field: 'title', message: 'Survey title is required' }
  if (t.length < SURVEY_TITLE_MIN_LENGTH) {
    return { field: 'title', message: `Survey title must be at least ${SURVEY_TITLE_MIN_LENGTH} characters long` }
  }
  if (t.length > SURVEY_TITLE_MAX_LENGTH) {
    return { field: 'title', message: `Survey title must not exceed ${SURVEY_TITLE_MAX_LENGTH} characters` }
  }
  return null
}

export const validateSurveyDescription = (description?: string): ValidationError | null => {
  if (!description || description.trim().length === 0) return null
  const d = description.trim()
  if (d.length < SURVEY_DESCRIPTION_MIN_LENGTH) {
    return { field: 'description', message: `Survey description must be at least ${SURVEY_DESCRIPTION_MIN_LENGTH} characters long` }
  }
  if (d.length > SURVEY_DESCRIPTION_MAX_LENGTH) {
    return { field: 'description', message: `Survey description must not exceed ${SURVEY_DESCRIPTION_MAX_LENGTH} characters` }
  }
  return null
}

export const validateSurveyColor = (color?: string): ValidationError | null => {
  if (!color || color.trim().length === 0) return null
  if (!REGEX_HEX_COLOR.test(color)) {
    return { field: 'primaryColor', message: 'Invalid color format. Use hex color code (e.g., #6366F1)' }
  }
  return null
}

export const validateLogoUrl = (url?: string): ValidationError | null => {
  if (!url || url.trim().length === 0) return null
  if (!REGEX_LOGO_URL.test(url.trim())) {
    return { field: 'logoUrl', message: 'Invalid logo URL. Must start with http://, https://, or data:image/' }
  }
  return null
}

export const validateSurveyStatus = (status: string): ValidationError | null => {
  if (!VALID_SURVEY_STATUSES.includes(status as typeof VALID_SURVEY_STATUSES[number])) {
    return { field: 'status', message: `Survey status must be one of: ${VALID_SURVEY_STATUSES.join(', ')}` }
  }
  return null
}

export const validateSurveyUpdate = (updates: {
  title?: string
  description?: string
  primaryColor?: string
  logoUrl?: string
  status?: string
}): Record<string, string> => {
  const errors: Record<string, string> = {}
  if (updates.title !== undefined) {
    const e = validateSurveyTitle(updates.title)
    if (e) errors[e.field] = e.message
  }
  if (updates.description !== undefined) {
    const e = validateSurveyDescription(updates.description)
    if (e) errors[e.field] = e.message
  }
  if (updates.primaryColor !== undefined) {
    const e = validateSurveyColor(updates.primaryColor)
    if (e) errors[e.field] = e.message
  }
  if (updates.logoUrl !== undefined) {
    const e = validateLogoUrl(updates.logoUrl)
    if (e) errors[e.field] = e.message
  }
  if (updates.status !== undefined) {
    const e = validateSurveyStatus(updates.status)
    if (e) errors[e.field] = e.message
  }
  return errors
}
// endregion

// region question validations
export const validateQuestionType = (type: string): ValidationError | null => {
  if (!VALID_QUESTION_TYPES.includes(type as typeof VALID_QUESTION_TYPES[number])) {
    return { field: 'type', message: `Question type must be one of: ${VALID_QUESTION_TYPES.join(', ')}` }
  }
  return null
}

export const validateQuestionTitle = (title: string): ValidationError | null => {
  const t = title.trim()
  if (t.length === 0) return { field: 'title', message: 'Question title is required' }
  if (t.length < QUESTION_TITLE_MIN_LENGTH) {
    return { field: 'title', message: `Question title must be at least ${QUESTION_TITLE_MIN_LENGTH} characters long` }
  }
  if (t.length > QUESTION_TITLE_MAX_LENGTH) {
    return { field: 'title', message: `Question title must not exceed ${QUESTION_TITLE_MAX_LENGTH} characters` }
  }
  return null
}

export const validateQuestionDescription = (description?: string): ValidationError | null => {
  if (!description || description.trim().length === 0) return null
  if (description.trim().length > QUESTION_DESCRIPTION_MAX_LENGTH) {
    return { field: 'description', message: `Question description must not exceed ${QUESTION_DESCRIPTION_MAX_LENGTH} characters` }
  }
  return null
}

export const validateQuestionOptions = (options?: string[]): ValidationError | null => {
  if (!options || options.length === 0) return null
  if (options.length < MIN_OPTIONS) {
    return { field: 'options', message: `Question must have at least ${MIN_OPTIONS} options` }
  }
  if (options.length > MAX_OPTIONS) {
    return { field: 'options', message: `Question must not have more than ${MAX_OPTIONS} options` }
  }
  if (options.some((opt) => opt.trim().length === 0)) {
    return { field: 'options', message: 'All options must be non-empty' }
  }
  const unique = new Set(options.map((opt) => opt.trim().toLowerCase()))
  if (unique.size !== options.length) {
    return { field: 'options', message: 'Duplicate options are not allowed' }
  }
  return null
}

export const validateQuestion = (question: {
  type: string
  title: string
  description?: string
  options?: string[]
}): Record<string, string> => {
  const errors: Record<string, string> = {}
  const typeError = validateQuestionType(question.type)
  if (typeError) errors[typeError.field] = typeError.message
  const titleError = validateQuestionTitle(question.title)
  if (titleError) errors[titleError.field] = titleError.message
  const descError = validateQuestionDescription(question.description)
  if (descError) errors[descError.field] = descError.message
  const optionsError = validateQuestionOptions(question.options)
  if (optionsError) errors[optionsError.field] = optionsError.message
  return errors
}
// endregion
