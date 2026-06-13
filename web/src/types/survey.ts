// Question
export interface Question {
  id: string
  surveyId: string
  type: 'short_text' | 'long_text' | 'multiple_choice' | 'checkbox_group' | 'dropdown' | 'rating' | 'yes_no'
  uiType?: 'input' | 'textarea' | 'radio' | 'checkbox_group' | 'select' | 'buttons' | 'toggle'
  title: string
  description?: string
  options?: string[]
  required: boolean
  order: number
  createdAt: string
  updatedAt: string
}

export type QuestionPayload = {
  type: 'short_text' | 'long_text' | 'multiple_choice' | 'rating' | 'yes_no'
  uiType?: 'input' | 'textarea' | 'radio' | 'checkbox_group' | 'select' | 'buttons' | 'toggle'
  title: string
  description?: string
  options?: string[]
  required?: boolean
}

// Survey
export interface Survey {
  id: string
  userId: string
  title: string
  description?: string
  slug: string
  primaryColor: string
  logoUrl?: string
  status: 'draft' | 'published' | 'closed' | 'archived'
  createdAt: string
  updatedAt: string
  publishedAt?: string
  responseCount: number
  questionCount: number
}

export interface SurveyWithQuestions extends Survey {
  questions: Question[]
}

// Response / Answer
export interface Answer {
  questionId: string
  value: string | string[] | number
}

export interface SurveyResponse {
  id: string
  surveyId: string
  answers: Answer[]
  submittedAt: string
}

// Component Props - Surveys
export interface SurveyCardProps {
  survey: Survey & {
    status?: 'draft' | 'published' | 'closed' | 'archived'
    responseCount?: number
    primaryColor?: string
  }
  onEdit: (id: string) => void
  onPreview: (slug: string) => void
  onShare: (slug: string) => void
  onDelete: (id: string) => void
}

export interface SurveyDetailsFormProps {
  title: string
  description: string
  onTitleChange: (value: string) => void
  onDescriptionChange: (value: string) => void
}

export interface BrandingFormProps {
  primaryColor: string
  logoUrl: string
  logoFileName?: string
  onColorChange: (value: string) => void
  onLogoUrlChange: (value: string) => void
  onLogoUpload: (file: File | null) => void
}

export interface EmptySurveysStateProps {
  onCreateClick: () => void
}

export interface ShareSectionProps {
  slug: string
  onCopyLink: () => void
  disabled?: boolean
}

export interface ShareSurveyModalProps {
  survey: { title: string; slug: string } | null
  onClose: () => void
  onCopy: (slug: string) => void
}

export interface ShareSurveyModalProps {
  survey: { title: string; slug: string } | null
  onClose: () => void
  onCopy: (slug: string) => void
}

export interface CreateSurveyModalProps {
  isOpen: boolean
  isLoading: boolean
  onClose: () => void
  onSubmit: (title: string, description?: string) => Promise<void>
}

export interface SurveysGridProps {
  surveys: Survey[]
  onEdit: (id: string) => void
  onPreview: (slug: string) => void
  onShare: (slug: string) => void
  onDelete: (id: string) => void
}

// Component Props - Survey Builder
export interface QuestionTypeOption {
  id: string
  label: string
  icon: React.ReactNode
  description?: string
}

export interface AddQuestionModalProps {
  isOpen: boolean
  isLoading: boolean
  onClose: () => void
  onSubmit: (
    type: 'short_text' | 'multiple_choice' | 'rating',
    title: string,
    description?: string,
    options?: string[]
  ) => Promise<void>
}

export interface QuestionsListProps {
  questions: Question[]
  isEmpty?: boolean
  surveyId: string
}

// Component Props - Survey Responses
export interface ResponsesListProps {
  responses: SurveyResponse[]
  questions: Question[]
  isEmpty?: boolean
}

export interface ResponsesSummaryProps {
  totalResponses: number
  totalQuestions: number
  responseRate?: number
}

// Store State
export interface SurveyState {
  surveys: Survey[]
  currentSurvey: SurveyWithQuestions | null
  isLoading: boolean
  error: string | null
}
