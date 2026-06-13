// region imports
import {
  createAsyncThunk,
  createSlice,
} from '@reduxjs/toolkit'
import * as responseAPI from '@/services/api/responses'
import * as questionAPI from '@/services/api/questions'
import type {
  SurveyResponse,
  Answer,
  QuestionPayload,
} from '@/types/survey'
// endregion

// region types
export interface ResponseState {
  responses: SurveyResponse[]
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
export const submitSurveyResponse =
  createAsyncThunk(
    'response/submitSurveyResponse',

    async (
      data: {
        surveyId: string
        answers: Answer[]
      },

      { rejectWithValue },
    ) => {
      try {
        // submit public survey response
        const response =
          await responseAPI.submitResponse(
            data.surveyId,
            data.answers,
          )

        // handle API validation errors
        if (
          !response.success ||
          !response.data
        ) {
          return rejectWithValue(
            response.errors || {
              general: response.message,
            },
          )
        }

        return response.data
      } catch (error: any) {
        return rejectWithValue({
          general:
            error.message ||
            'Failed to submit response',
        })
      }
    },
  )
// endregion

// region fetch survey responses
export const fetchSurveyResponses =
  createAsyncThunk(
    'response/fetchSurveyResponses',

    async (
      surveyId: string,

      { rejectWithValue },
    ) => {
      try {
        // fetch all survey responses
        const response =
          await responseAPI.getSurveyResponses(
            surveyId,
          )

        // handle API validation errors
        if (
          !response.success ||
          !response.data
        ) {
          return rejectWithValue(
            response.errors || {
              general: response.message,
            },
          )
        }

        return response.data
      } catch (error: any) {
        return rejectWithValue({
          general:
            error.message ||
            'Failed to fetch responses',
        })
      }
    },
  )
// endregion

// region add question
export const addQuestionToSurvey = createAsyncThunk(
  'question/addQuestionToSurvey',
  async (data: { surveyId: string } & QuestionPayload, { rejectWithValue }) => {
    try {
      const { surveyId, ...payload } = data
      const response = await questionAPI.addQuestion(surveyId, payload)
      if (!response.success || !response.data) {
        return rejectWithValue(response.errors || { general: response.message })
      }
      return response.data
    } catch (error: any) {
      return rejectWithValue({ general: error.message || 'Failed to add question' })
    }
  },
)
// endregion

// region update question
export const updateQuestionDetails = createAsyncThunk(
  'question/updateQuestionDetails',
  async (data: { surveyId: string; questionId: string } & Partial<QuestionPayload>, { rejectWithValue }) => {
    try {
      const { surveyId, questionId, ...payload } = data
      const response = await questionAPI.updateQuestion(surveyId, questionId, payload)
      if (!response.success || !response.data) {
        return rejectWithValue(response.errors || { general: response.message })
      }
      return response.data
    } catch (error: any) {
      return rejectWithValue({ general: error.message || 'Failed to update question' })
    }
  },
)
// endregion

// region delete question
export const deleteQuestionFromSurvey = createAsyncThunk(
  'question/deleteQuestionFromSurvey',
  async (data: { surveyId: string; questionId: string }, { rejectWithValue }) => {
    try {
      const response = await questionAPI.deleteQuestion(data.surveyId, data.questionId)
      if (!response.success) {
        return rejectWithValue(response.errors || { general: response.message })
      }
      return data.questionId
    } catch (error: any) {
      return rejectWithValue({ general: error.message || 'Failed to delete question' })
    }
  },
)
// endregion

// region reorder questions
export const reorderSurveyQuestions = createAsyncThunk(
  'question/reorderSurveyQuestions',
  async (data: { surveyId: string; questionIds: string[] }, { rejectWithValue }) => {
    try {
      const response = await questionAPI.reorderQuestions(data.surveyId, data.questionIds)
      if (!response.success || !response.data) {
        return rejectWithValue(response.errors || { general: response.message })
      }
      return response.data
    } catch (error: any) {
      return rejectWithValue({ general: error.message || 'Failed to reorder questions' })
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
      // clear response errors
      state.error = null
    },

    clearResponses: (state) => {
      // clear stored responses
      state.responses = []
    },
  },

  extraReducers: (builder) => {
    // region submit response reducers

    builder
      .addCase(
        submitSurveyResponse.pending,
        (state) => {
          state.isLoading = true
          state.error = null
        },
      )

      .addCase(
        submitSurveyResponse.fulfilled,
        (state, action) => {
          state.isLoading = false

          // append new response
          state.responses.push(
            action.payload,
          )
        },
      )

      .addCase(
        submitSurveyResponse.rejected,
        (state, action) => {
          state.isLoading = false

          state.error =
            action.payload as Record<
              string,
              string
            >
        },
      )

    // endregion

    // region fetch responses reducers

    builder
      .addCase(
        fetchSurveyResponses.pending,
        (state) => {
          state.isLoading = true
          state.error = null
        },
      )

      .addCase(
        fetchSurveyResponses.fulfilled,
        (state, action) => {
          state.isLoading = false

          // store fetched responses
          state.responses =
            action.payload
        },
      )

      .addCase(
        fetchSurveyResponses.rejected,
        (state, action) => {
          state.isLoading = false

          state.error =
            action.payload as Record<
              string,
              string
            >
        },
      )

    // endregion
  },
})
// endregion

// region exports
export const {
  clearError,
  clearResponses,
} = responseSlice.actions

export default responseSlice.reducer
// endregion