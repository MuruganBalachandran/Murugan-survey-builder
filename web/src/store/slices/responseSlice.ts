// region imports
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import * as responseAPI from '@/services/api/responses'
import type { Answer, SurveyResponse } from '@/types/survey'
import type { DashboardResponse } from '@/types/pages'
// endregion

// region types
export interface ResponseState {
  responses: DashboardResponse[]
  isLoading: boolean
  error: Record<string, string> | null
}
// endregion

// region initial state
const initialState: ResponseState = {
  responses: [],
  isLoading: false,
  error: null,
}
// endregion

// region submit survey response
export const submitSurveyResponse = createAsyncThunk(
  'response/submitSurveyResponse',

  async (
    data: {
      surveyId: string
      answers: Answer[]
    },

    { rejectWithValue },
  ) => {
    try {
      const response = await responseAPI.submitResponse(data.surveyId, data.answers)

      if (!response.success || !response.data) {
        return rejectWithValue(
          response.errors || {
            general: response.message,
          },
        )
      }

      return response.data
    } catch (error: any) {
      return rejectWithValue({
        general: error.message || 'Failed to submit response',
      })
    }
  },
)
// endregion

// region fetch survey responses
export const fetchSurveyResponses = createAsyncThunk(
  'response/fetchSurveyResponses',

  async (
    data:
      | string
      | {
          surveyId: string
          surveyTitle?: string
          questionCount?: number
          page?: number
          pageSize?: number
        },

    { rejectWithValue },
  ) => {
    // support multiple input forms — legacy string, object with metadata, or object with pagination
    const surveyId = typeof data === 'string' ? data : data.surveyId
    const surveyTitle = typeof data === 'string' ? undefined : data.surveyTitle
    const questionCount = typeof data === 'string' ? undefined : data.questionCount
    const page = typeof data === 'string' ? 1 : data.page ?? 1
    const pageSize = typeof data === 'string' ? 10 : data.pageSize ?? 10

    try {
      const response = await responseAPI.getSurveyResponses(surveyId, page, pageSize)

      if (!response.success || !response.data) {
        return rejectWithValue(
          response.errors || {
            general: response.message,
          },
        )
      }

      return {
        surveyId,
        surveyTitle,
        questionCount,
        responses: response.data.responses,
        total: response.data.total,
        page: response.data.page,
        pageSize: response.data.pageSize,
      }
    } catch (error: any) {
      return rejectWithValue({
        general: error.message || 'Failed to fetch responses',
      })
    }
  },
)
// endregion

// region response slice
const responseSlice = createSlice({
  name: 'response',

  initialState,

  reducers: {
    clearError: (state) => {
      state.error = null
    },

    clearResponses: (state) => {
      state.responses = []
    },
  },

  extraReducers: (builder) => {
    // region submit response reducers

    builder
      .addCase(submitSurveyResponse.pending, (state) => {
        state.isLoading = true
        state.error = null
      })

      .addCase(submitSurveyResponse.fulfilled, (state, action) => {
        state.isLoading = false
        const r = action.payload as SurveyResponse
        state.responses.push({
          ...r,
          surveyId: r.surveyId,
          surveyTitle: '',
          questionCount: 0,
        })
      })

      .addCase(submitSurveyResponse.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as Record<string, string>
      })

    // endregion

    // region fetch responses reducers

    builder
      .addCase(fetchSurveyResponses.pending, (state) => {
        state.isLoading = true
        state.error = null
      })

      .addCase(fetchSurveyResponses.fulfilled, (state, action) => {
        state.isLoading = false
        const { surveyId, surveyTitle, questionCount, responses } = action.payload as {
          surveyId: string
          surveyTitle?: string
          questionCount?: number
          responses: SurveyResponse[]
        }

        // remove existing entries for this survey then append enriched ones
        state.responses = [
          ...state.responses.filter((r) => r.surveyId !== surveyId),
          ...responses.map((r) => ({
            ...r,
            surveyId,
            surveyTitle: surveyTitle ?? '',
            questionCount: questionCount ?? 0,
          })),
        ]
      })

      .addCase(fetchSurveyResponses.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as Record<string, string>
      })

    // endregion
  },
})
// endregion

// region exports
export const { clearError, clearResponses } = responseSlice.actions

export default responseSlice.reducer
// endregion
