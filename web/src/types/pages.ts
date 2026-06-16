import type { Question, Survey, SurveyResponse } from './survey'

// Dashboard page types
export interface DashboardResponse extends SurveyResponse {
  surveyId: string
  surveyTitle: string
  questionCount: number
  submittedAt: string
}

export interface StatCardProps {
  label: string
  value: string
  detail: string
  icon?: React.ReactNode
  iconClassName?: string
  trend?: {
    value: number
    isPositive: boolean
  }
}

// Surveys page types
export type SurveyRecord = Survey & {
  primaryColor?: string
  status?: 'draft' | 'published' | 'closed' | 'archived'
  responseCount?: number
  questionCount?: number
  questions?: Question[]
}

export type QuestionType =
  | 'short_text'
  | 'long_text'
  | 'multiple_choice'
  | 'checkbox_group'
  | 'dropdown'
  | 'rating'
  | 'yes_no'

export type QuestionUiType =
  | 'input'
  | 'textarea'
  | 'radio'
  | 'checkbox_group'
  | 'select'
  | 'buttons'
  | 'toggle'

export interface QuestionFormState {
  id?: string
  type: QuestionType
  uiType: QuestionUiType
  title: string
  description: string
  options: string[]
  required: boolean
}

export interface QuestionComposerProps {
  isOpen: boolean
  mode: 'create' | 'edit'
  question?: QuestionFormState
  form?: QuestionFormState
  errors?: Record<string, string>
  isSaving?: boolean
  onClose: () => void
  onSave: () => void
  onChange?: (updater: (current: QuestionFormState) => QuestionFormState) => void
  isLoading?: boolean
}

export interface SurveyBasicsStepProps {
  title: string
  description: string
  error?: string
  descriptionError?: string
  onTitleChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onTitleBlur?: () => void
  onDescriptionBlur?: () => void
  errors?: Record<string, string>
}

export interface SurveyBrandingStepProps {
  primaryColor: string
  logoUrl: string
  logoFileName?: string
  onColorChange: (value: string) => void
  onLogoUrlChange: (value: string) => void
  onLogoUpload: (file: File | null) => void
  onLogoUrlBlur?: () => void
  errors?: Record<string, string>
}

export interface SurveyQuestionsStepProps {
  surveyTitle: string
  surveyDescription?: string
  questions: Question[]
  isQuestionsLoading?: boolean
  isDraggingQuestionId?: string | null
  onAddQuestion: () => void
  onEditQuestion: (question: Question) => void
  onDeleteQuestion: (question: Question) => void
  onQuestionDragStart?: (questionId: string) => void
  onQuestionDragOver?: (event: React.DragEvent) => void
  onQuestionDrop?: (targetQuestionId: string) => void
  onQuestionDragEnd?: () => void
  errors?: Record<string, string>
}

export interface SurveyPublishStepProps {
  surveyTitle: string
  surveySlug?: string
  isPublished?: boolean
  isPublishing?: boolean
  onCopyLink?: () => void
  onPreview?: () => void
  errors?: Record<string, string>
}

export type PaginationItem = number | 'ellipsis'
