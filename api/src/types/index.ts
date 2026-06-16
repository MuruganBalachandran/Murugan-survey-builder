// region auth types
export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthPayload {
  email: string;
  password: string;
}

export interface SignupPayload extends AuthPayload {
  name: string;
  confirmPassword: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;

  user?: {
    id: string;
    email: string;
    name: string;
  };

  errors?: Record<string, string>;
}
// endregion

// region survey types
export type SurveyStatus = "draft" | "published" | "closed";

export interface Survey {
  id: string;
  userId: string;
  title: string;
  description?: string;
  slug: string;
  primaryColor: string;
  logoUrl?: string;
  status: SurveyStatus;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  endsAt?: string;
  maxResponses?: number;
  thankYouMessage?: string;
  responseCount: number;
  questionCount: number;
}

export interface SurveyListParams {
  page: number;
  pageSize: number;
  search?: string;
  status?: string;
  dateRange?: string;
  sort?: string;
}
// endregion

// region question types

export type QuestionType =
  | "short_text"
  | "long_text"
  | "multiple_choice"
  | "checkbox_group"
  | "dropdown"
  | "rating"
  | "yes_no";

export type QuestionUiType =
  | "input"
  | "textarea"
  | "radio"
  | "checkbox_group"
  | "select"
  | "buttons"
  | "toggle";

// conditional logic rule — a question is shown only when this condition is met
export interface VisibleIf {
  questionId: string;
  operator: "equals" | "not_equals";
  value: string;
}

export interface Question {
  id: string;
  surveyId: string;
  type: QuestionType;
  uiType?: QuestionUiType;
  title: string;
  description?: string;
  options?: string[];
  required: boolean;
  order: number;
  // character limits — applied to short_text and long_text responses
  minLength?: number;
  maxLength?: number;
  // conditional logic — question is hidden unless this rule evaluates to true
  visibleIf?: VisibleIf;
  createdAt: string;
  updatedAt: string;
}
// endregion

// region response types
export type AnswerValue = string | string[] | number;

export interface Answer {
  questionId: string;
  value: AnswerValue;
}

export interface SurveyResponse {
  id: string;
  surveyId: string;
  answers: Answer[];
  submittedAt: string;
}
// endregion

// region rate limit types
export interface RateLimitRecord {
  count: number;
  resetAt: number;
}
// endregion

// region middleware types
export interface AuthContext {
  userId: string;
  email: string;
}

export interface UnauthorizedResponse {
  success: false;
  message: string;
}

export interface ApiError {
  code: string;
  details?: string;
}

export interface ErrorResponse {
  success: false;
  message: string;
  error: ApiError;
  timestamp: string;
}

export interface NotFoundError {
  code: "NOT_FOUND";
  path: string;
  method: string;
}

export interface NotFoundResponse {
  success: false;
  message: string;
  error: NotFoundError;
  timestamp: string;
}
// endregion

// region validation types
export interface ValidationError {
  field: string;
  message: string;
}
// endregion

// region api types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string>;
}

export interface SurveyWithQuestions extends Survey {
  questions: Question[];
}

export interface SurveyResponseWithQuestions {
  response: SurveyResponse;
  survey: Survey;
  questions: Question[];
}
// endregion
