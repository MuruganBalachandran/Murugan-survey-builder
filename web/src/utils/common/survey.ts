// region imports
import type {
  QuestionType,
  QuestionUiType,
  PaginationItem,
} from '@/types'
// endregion

// region question type utilities
// get question type label
export function getQuestionTypeLabel(
  type:
    | QuestionType
    | string,
): string {
  const labels: Record<
    string,
    string
  > = {
    short_text:
      'Short Text',

    long_text:
      'Long Text',

    multiple_choice:
      'Multiple Choice',

    checkbox_group:
      'Checkbox',

    dropdown:
      'Dropdown',

    rating: 'Rating',

    yes_no: 'Yes / No',
  }

  return (
    labels[type] ?? 'Unknown'
  )
}

// get question type icon
export function getQuestionTypeIcon(
  type:
    | QuestionType
    | string,
): string {
  const icons: Record<
    string,
    string
  > = {
    short_text: '✏️',

    long_text: '📝',

    multiple_choice: '◯',

    checkbox_group:
      '☑️',

    dropdown: '▼',

    rating: '⭐',

    yes_no: '✓✗',
  }

  return icons[type] ?? '❓'
}

// get question type description
export function getQuestionTypeDescription(
  type:
    | QuestionType
    | string,
): string {
  const descriptions: Record<
    string,
    string
  > = {
    short_text:
      'Single line text response',

    long_text:
      'Multi-line text response',

    multiple_choice:
      'Choose one from multiple options',

    checkbox_group:
      'Choose multiple options',

    dropdown:
      'Select from dropdown list',

    rating:
      'Rate on a scale',

    yes_no:
      'Yes or no answer',
  }

  return (
    descriptions[type] ?? ''
  )
}

// get human-readable label for a question type based on type and UI type
export const questionTypeLabel = (type: string, uiType?: QuestionUiType): string => {
  switch (uiType) {
    case 'textarea':
      return 'Long text'
    case 'radio':
      return 'Radio'
    case 'checkbox_group':
      return 'Checkbox'
    case 'select':
      return 'Dropdown'
    case 'buttons':
      return 'Rating'
    case 'toggle':
      return 'Yes / No'
    case 'input':
      return 'Short text'
  }

  switch (type) {
    case 'short_text':
      return 'Short text'
    case 'long_text':
      return 'Long text'
    case 'multiple_choice':
      return 'Multiple choice'
    case 'checkbox_group':
      return 'Checkbox'
    case 'dropdown':
      return 'Dropdown'
    case 'rating':
      return 'Rating'
    case 'yes_no':
      return 'Yes / No'
    default:
      return type
  }
}

// normalize question type to standardized format
export const normalizeQuestionType = (type: QuestionType) => {
  switch (type) {
    case 'long_text':
      return { type: 'long_text' as const, uiType: 'textarea' as const }
    case 'checkbox_group':
      return { type: 'multiple_choice' as const, uiType: 'checkbox_group' as const }
    case 'dropdown':
      return { type: 'multiple_choice' as const, uiType: 'select' as const }
    case 'yes_no':
      return { type: 'short_text' as const, uiType: 'toggle' as const }
    case 'rating':
      return { type: 'rating' as const, uiType: 'buttons' as const }
    case 'multiple_choice':
      return { type: 'multiple_choice' as const, uiType: 'radio' as const }
    case 'short_text':
    default:
      return { type: 'short_text' as const, uiType: 'input' as const }
  }
}
// endregion

// region survey status utilities
// get human-readable status label for survey
export const statusLabel = (status?: string): string => {
  switch (status) {
    case 'published':
      return 'Published'
    case 'closed':
      return 'Closed'
    case 'archived':
      return 'Archived'
    default:
      return 'Draft'
  }
}
// endregion

// region survey progress utilities
// survey progress state
export interface ProgressState {
  current: number
  total: number
  percentage: number
  isComplete: boolean
}

// calculate survey progress
export function calculateProgress(
  answeredCount: number,
  totalQuestions: number,
): ProgressState {
  const current = Math.min(
    answeredCount,
    totalQuestions,
  )

  return {
    current,

    total: totalQuestions,

    percentage:
      totalQuestions > 0
        ? Math.round(
            (current /
              totalQuestions) *
              100,
          )
        : 0,

    isComplete:
      current >= totalQuestions,
  }
}

// check whether question is answered
export function isQuestionAnswered(
  value: any,
): boolean {
  // validate string answers
  if (
    typeof value === 'string'
  ) {
    return (
      value.trim().length > 0
    )
  }

  // validate array answers
  if (Array.isArray(value)) {
    return value.length > 0
  }

  // validate primitive answers
  return (
    typeof value ===
      'number' ||
    typeof value ===
      'boolean'
  )
}
// endregion

// region pagination utilities
// build pagination items for displaying page numbers with ellipsis
export const buildPaginationItems = (currentPage: number, totalPages: number): PaginationItem[] => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const items: PaginationItem[] = [1]
  const left = Math.max(2, currentPage - 1)
  const right = Math.min(totalPages - 1, currentPage + 1)

  if (left > 2) {
    items.push('ellipsis')
  }

  for (let page = left; page <= right; page += 1) {
    items.push(page)
  }

  if (right < totalPages - 1) {
    items.push('ellipsis')
  }

  items.push(totalPages)
  return items
}
// endregion

// region survey URL utilities
// generate survey URL from slug
export const getSurveyUrl = (slug: string): string => `${window.location.origin}/survey/${slug}`
// endregion

// region file utilities
// read file as data URL
export const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
// endregion