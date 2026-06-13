// region types

export interface ValidationError {
  field: string
  message: string
}

// endregion

// region auth validation constants

const PASSWORD_MIN_LENGTH = 8

// endregion

// region survey validation constants

const SURVEY_TITLE_MIN_LENGTH = 3
const SURVEY_TITLE_MAX_LENGTH = 200

const SURVEY_DESCRIPTION_MIN_LENGTH = 10
const SURVEY_DESCRIPTION_MAX_LENGTH = 1000

// endregion

// region question validation constants

const QUESTION_TITLE_MIN_LENGTH = 3
const QUESTION_TITLE_MAX_LENGTH = 500

const QUESTION_DESCRIPTION_MAX_LENGTH = 1000

const MIN_OPTIONS = 2
const MAX_OPTIONS = 50

// endregion

// region auth validations

export const validateEmail = (
  email: string,
): ValidationError | null => {
  // validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!emailRegex.test(email)) {
    return {
      field: 'email',
      message: 'Invalid email format',
    }
  }

  return null
}

export const validatePassword = (
  password: string,
): ValidationError | null => {
  // validate password length
  if (password.length < PASSWORD_MIN_LENGTH) {
    return {
      field: 'password',
      message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`,
    }
  }

  // validate lowercase letter
  if (!/[a-z]/.test(password)) {
    return {
      field: 'password',
      message: 'Password must contain at least one lowercase letter',
    }
  }

  // validate uppercase letter
  if (!/[A-Z]/.test(password)) {
    return {
      field: 'password',
      message: 'Password must contain at least one uppercase letter',
    }
  }

  // validate special character
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    return {
      field: 'password',
      message: 'Password must contain at least one special character',
    }
  }

  return null
}

export const validateName = (
  name: string,
): ValidationError | null => {
  // validate minimum name length
  if (name.trim().length < 2) {
    return {
      field: 'name',
      message: 'Name must be at least 2 characters long',
    }
  }

  return null
}

export const validateSignup = (
  email: string,
  password: string,
  name: string,
): Record<string, string> => {
  const errors: Record<string, string> = {}

  // validate email
  const emailError = validateEmail(email)

  if (emailError) {
    errors[emailError.field] = emailError.message
  }

  // validate password
  const passwordError = validatePassword(password)

  if (passwordError) {
    errors[passwordError.field] = passwordError.message
  }

  // validate name
  const nameError = validateName(name)

  if (nameError) {
    errors[nameError.field] = nameError.message
  }

  return errors
}

export const validateLogin = (
  email: string,
  password: string,
): Record<string, string> => {
  const errors: Record<string, string> = {}

  // validate email
  const emailError = validateEmail(email)

  if (emailError) {
    errors[emailError.field] = emailError.message
  }

  // validate password existence
  if (!password || password.length === 0) {
    errors.password = 'Password is required'
  }

  return errors
}

// endregion

// region survey validations

export const validateSurveyTitle = (
  title: string,
): ValidationError | null => {
  const trimmedTitle = title.trim()

  // validate required title
  if (trimmedTitle.length === 0) {
    return {
      field: 'title',
      message: 'Survey title is required',
    }
  }

  // validate minimum title length
  if (trimmedTitle.length < SURVEY_TITLE_MIN_LENGTH) {
    return {
      field: 'title',
      message: `Survey title must be at least ${SURVEY_TITLE_MIN_LENGTH} characters long`,
    }
  }

  // validate maximum title length
  if (trimmedTitle.length > SURVEY_TITLE_MAX_LENGTH) {
    return {
      field: 'title',
      message: `Survey title must not exceed ${SURVEY_TITLE_MAX_LENGTH} characters`,
    }
  }

  return null
}

export const validateSurveyDescription = (
  description?: string,
): ValidationError | null => {
  // allow empty description
  if (!description || description.trim().length === 0) {
    return null
  }

  const trimmedDescription = description.trim()

  // validate minimum description length
  if (trimmedDescription.length < SURVEY_DESCRIPTION_MIN_LENGTH) {
    return {
      field: 'description',
      message: `Survey description must be at least ${SURVEY_DESCRIPTION_MIN_LENGTH} characters long`,
    }
  }

  // validate maximum description length
  if (trimmedDescription.length > SURVEY_DESCRIPTION_MAX_LENGTH) {
    return {
      field: 'description',
      message: `Survey description must not exceed ${SURVEY_DESCRIPTION_MAX_LENGTH} characters`,
    }
  }

  return null
}

export const validateSurveyColor = (
  color?: string,
): ValidationError | null => {
  // allow empty color
  if (!color || color.trim().length === 0) {
    return null
  }

  // validate hex color format
  const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/

  if (!colorRegex.test(color)) {
    return {
      field: 'primaryColor',
      message: 'Invalid color format. Use hex color code (e.g., #6366F1)',
    }
  }

  return null
}

export const validateLogoUrl = (
  url?: string,
): ValidationError | null => {
  // allow empty logo URL
  if (!url || url.trim().length === 0) {
    return null
  }

  const trimmedUrl = url.trim()

  // validate image URL format
  const urlRegex = /^(https?:\/\/|data:image\/).*$/i

  if (!urlRegex.test(trimmedUrl)) {
    return {
      field: 'logoUrl',
      message: 'Invalid logo URL. Must start with http://, https://, or data:image/',
    }
  }

  return null
}

export const validateSurveyStatus = (
  status: string,
): ValidationError | null => {
  // valid survey statuses
  const validStatuses = [
    'draft',
    'published',
    'closed',
    'archived',
  ]

  // validate survey status
  if (!validStatuses.includes(status)) {
    return {
      field: 'status',
      message: `Survey status must be one of: ${validStatuses.join(', ')}`,
    }
  }

  return null
}

export const validateSurveyUpdate = (
  updates: {
    title?: string
    description?: string
    primaryColor?: string
    logoUrl?: string
    status?: string
  },
): Record<string, string> => {
  const errors: Record<string, string> = {}

  // validate title update
  if (updates.title !== undefined) {
    const titleError = validateSurveyTitle(updates.title)

    if (titleError) {
      errors[titleError.field] = titleError.message
    }
  }

  // validate description update
  if (updates.description !== undefined) {
    const descError = validateSurveyDescription(updates.description)

    if (descError) {
      errors[descError.field] = descError.message
    }
  }

  // validate color update
  if (updates.primaryColor !== undefined) {
    const colorError = validateSurveyColor(updates.primaryColor)

    if (colorError) {
      errors[colorError.field] = colorError.message
    }
  }

  // validate logo URL update
  if (updates.logoUrl !== undefined) {
    const logoError = validateLogoUrl(updates.logoUrl)

    if (logoError) {
      errors[logoError.field] = logoError.message
    }
  }

  // validate status update
  if (updates.status !== undefined) {
    const statusError = validateSurveyStatus(updates.status)

    if (statusError) {
      errors[statusError.field] = statusError.message
    }
  }

  return errors
}

// endregion

// region question validations

export const validateQuestionType = (
  type: string,
): ValidationError | null => {
  // valid question types
  const validTypes = [
    'short_text',
    'long_text',
    'multiple_choice',
    'checkbox_group',
    'dropdown',
    'rating',
    'yes_no',
  ]

  // validate question type
  if (!validTypes.includes(type)) {
    return {
      field: 'type',
      message: `Question type must be one of: ${validTypes.join(', ')}`,
    }
  }

  return null
}

export const validateQuestionTitle = (
  title: string,
): ValidationError | null => {
  const trimmedTitle = title.trim()

  // validate required title
  if (trimmedTitle.length === 0) {
    return {
      field: 'title',
      message: 'Question title is required',
    }
  }

  // validate minimum title length
  if (trimmedTitle.length < QUESTION_TITLE_MIN_LENGTH) {
    return {
      field: 'title',
      message: `Question title must be at least ${QUESTION_TITLE_MIN_LENGTH} characters long`,
    }
  }

  // validate maximum title length
  if (trimmedTitle.length > QUESTION_TITLE_MAX_LENGTH) {
    return {
      field: 'title',
      message: `Question title must not exceed ${QUESTION_TITLE_MAX_LENGTH} characters`,
    }
  }

  return null
}

export const validateQuestionDescription = (
  description?: string,
): ValidationError | null => {
  // allow empty description
  if (!description || description.trim().length === 0) {
    return null
  }

  const trimmedDescription = description.trim()

  // validate maximum description length
  if (trimmedDescription.length > QUESTION_DESCRIPTION_MAX_LENGTH) {
    return {
      field: 'description',
      message: `Question description must not exceed ${QUESTION_DESCRIPTION_MAX_LENGTH} characters`,
    }
  }

  return null
}

export const validateQuestionOptions = (
  options?: string[],
): ValidationError | null => {
  // allow empty options
  if (!options || options.length === 0) {
    return null
  }

  // validate minimum options
  if (options.length < MIN_OPTIONS) {
    return {
      field: 'options',
      message: `Question must have at least ${MIN_OPTIONS} options`,
    }
  }

  // validate maximum options
  if (options.length > MAX_OPTIONS) {
    return {
      field: 'options',
      message: `Question must not have more than ${MAX_OPTIONS} options`,
    }
  }

  // validate non-empty options
  const nonEmptyOptions = options.filter(
    (opt) => opt.trim().length > 0,
  )

  if (nonEmptyOptions.length !== options.length) {
    return {
      field: 'options',
      message: 'All options must be non-empty',
    }
  }

  // validate duplicate options
  const uniqueOptions = new Set(
    options.map((opt) => opt.trim().toLowerCase()),
  )

  if (uniqueOptions.size !== options.length) {
    return {
      field: 'options',
      message: 'Duplicate options are not allowed',
    }
  }

  return null
}

export const validateQuestion = (
  question: {
    type: string
    title: string
    description?: string
    options?: string[]
  },
): Record<string, string> => {
  const errors: Record<string, string> = {}

  // validate question type
  const typeError = validateQuestionType(question.type)

  if (typeError) {
    errors[typeError.field] = typeError.message
  }

  // validate question title
  const titleError = validateQuestionTitle(question.title)

  if (titleError) {
    errors[titleError.field] = titleError.message
  }

  // validate question description
  const descError = validateQuestionDescription(question.description)

  if (descError) {
    errors[descError.field] = descError.message
  }

  // validate question options
  const optionsError = validateQuestionOptions(question.options)

  if (optionsError) {
    errors[optionsError.field] = optionsError.message
  }

  return errors
}

// endregion