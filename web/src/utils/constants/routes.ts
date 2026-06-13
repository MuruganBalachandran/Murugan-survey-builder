
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/',
  SURVEY_CREATE: '/surveys/create',
  SURVEY_BUILDER: (id: string) => `/surveys/${id}/edit`,
  SURVEY_RESPONSES: (id: string) => `/surveys/${id}/responses`,
  PUBLIC_SURVEY: (id: string) => `/public/${id}`,
} as const

export const API_ROUTES = {
  HEALTH: '/api/health',
  SURVEYS: '/api/surveys',
  SURVEY: (id: string) => `/api/surveys/${id}`,
  SURVEY_RESPONSES: (id: string) => `/api/surveys/${id}/responses`,
  SUBMIT_RESPONSE: '/api/responses',
} as const
