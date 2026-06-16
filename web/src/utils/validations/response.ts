// region imports
import type { Answer, Question } from '@/types/survey'
// endregion

// region response validation types
// response validation result structure
export interface ResponseValidationResult {
  isValid: boolean
  errors: Record<string, string>
}
// endregion

// region answer validation utilities
// validate single answer
export function validateAnswer(answer: Answer, question: Question): string | null {
  // validate required empty value
  if (question.required && !answer.value) {
    return 'This question is required'
  }

  // validate required string answer
  if (typeof answer.value === 'string' && question.required && answer.value.trim().length === 0) {
    return 'This question is required'
  }

  // validate required array answer
  if (Array.isArray(answer.value) && question.required && answer.value.length === 0) {
    return 'Please select at least one option'
  }

  return null
}
// endregion

// region response validation utilities
// validate complete survey response
export function validateResponse(
  answers: Answer[],
  questions: Question[],
): ResponseValidationResult {
  const errors: Record<string, string> = {}

  // validate all survey questions
  for (const question of questions) {
    const answer = answers.find((a) => a.questionId === question.id)

    const error = validateAnswer(
      answer || {
        questionId: question.id,

        value: '',
      },

      question,
    )

    // store validation error
    if (error) {
      errors[question.id] = error
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,

    errors,
  }
}
// endregion
