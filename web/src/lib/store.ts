import { create } from 'zustand'
import type { Answer, Survey, SurveyResponse, User } from '@/types'
import { createId } from '@/types'

interface AppStore {
  // Auth
  currentUser: User | null
  setCurrentUser: (user: User | null) => void

  // Surveys
  surveys: Survey[]
  setSurveys: (surveys: Survey[]) => void
  addSurvey: (survey: Survey) => void
  updateSurvey: (survey: Survey) => void
  deleteSurvey: (id: string) => void

  // Responses
  responses: Record<string, SurveyResponse[]>
  getResponsesBySurvey: (surveyId: string) => SurveyResponse[]
  addResponse: (response: SurveyResponse) => void
  setResponses: (responses: Record<string, SurveyResponse[]>) => void

  // UI
  toasts: Array<{ id: string; variant: string; title: string; description?: string }>
  addToast: (toast: { variant: string; title: string; description?: string }) => void
  removeToast: (id: string) => void
}

// Mock data
const mockUser: User = {
  id: createId('user-1'),
  email: 'demo@example.com',
  name: 'Demo User',
  createdAt: new Date().toISOString(),
}

export const useAppStore = create<AppStore>((set, get) => ({
  currentUser: mockUser,
  setCurrentUser: (user) => set({ currentUser: user }),

  surveys: [],
  setSurveys: (surveys) => set({ surveys }),
  addSurvey: (survey) => set((state) => ({ surveys: [survey, ...state.surveys] })),
  updateSurvey: (survey) =>
    set((state) => ({
      surveys: state.surveys.map((s) => (s.id === survey.id ? survey : s)),
    })),
  deleteSurvey: (id) =>
    set((state) => ({
      surveys: state.surveys.filter((s) => s.id !== id),
    })),

  responses: {},
  getResponsesBySurvey: (surveyId) => {
    return get().responses[surveyId] || []
  },
  addResponse: (response) =>
    set((state) => ({
      responses: {
        ...state.responses,
        [response.surveyId]: [...(state.responses[response.surveyId] || []), response],
      },
    })),
  setResponses: (responses) => set({ responses }),

  toasts: [],
  addToast: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, { id: createId(Date.now().toString()), ...toast }],
    })),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}))
