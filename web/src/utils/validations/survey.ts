// region imports
import type {
  QuestionFormState,
} from '@/types'
import {
  isNonEmpty,
  isWithinLength,
  hasUniqueValues,
} from './common'
// endregion

// region survey validation utilities
// validate survey title
export function isValidSurveyTitle(
  title: string,
): boolean {
  return isWithinLength(
    title,
    3,
    20,
  )
}

// validate survey description
export function isValidSurveyDescription(
  description:
    | string
    | undefined,
): boolean {
  // description is optional
  if (!description)
    return true

  return isWithinLength(
    description,
    5,
    100,
  )
}
// endregion

// region question validation utilities
// validate question title
export function isValidQuestionTitle(
  title: string,
): boolean {
  return isWithinLength(
    title,
    3,
    100,
  )
}

// validate question options
export function isValidQuestionOptions(
  options: string[],
): boolean {
  // validate array input
  if (
    !Array.isArray(options)
  ) {
    return false
  }

  const cleaned = options
    .map((opt) =>
      opt.trim(),
    )
    .filter(Boolean)

  // require minimum options
  if (cleaned.length < 2) {
    return false
  }

  // validate unique options
  return hasUniqueValues(
    options,
  )
}

// check whether question type supports options
export function isMultipleChoiceQuestion(
  type: string,
): type is
  | 'multiple_choice'
  | 'checkbox_group'
  | 'dropdown' {
  return (
    type ===
      'multiple_choice' ||
    type ===
      'checkbox_group' ||
    type === 'dropdown'
  )
}
// endregion

// region form validation utilities
// validate question form fields
export function validateQuestionForm(
  form: QuestionFormState,
): Record<string, boolean> {
  return {
    title:
      isValidQuestionTitle(
        form.title,
      ),

    options:
      isMultipleChoiceQuestion(
        form.type,
      )
        ? isValidQuestionOptions(
            form.options,
          )
        : true,
  }
}

// validate survey form fields
export function validateSurveyForm(
  form: {
    title: string
    description: string
  },
): Record<string, boolean> {
  return {
    title:
      isValidSurveyTitle(
        form.title,
      ),

    description:
      isValidSurveyDescription(
        form.description,
      ),
  }
}
// endregion