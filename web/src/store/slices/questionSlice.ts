// region imports
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import * as questionAPI from '@/services/api/questions'
import type { Question, QuestionPayload } from '@/types/survey'
// endregion

// region types
export interface QuestionState {
  isLoading: boolean
  error: Record<string, string> | null
}
// endregion

// region initial state
const initialState: QuestionState = {
  isLoading: false,
  error: null,
}
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
  async (
    data: { surveyId: string; questionId: string } & Partial<QuestionPayload>,
    { rejectWithValue },
  ) => {
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
      return response.data as Question[]
    } catch (error: any) {
      return rejectWithValue({ general: error.message || 'Failed to reorder questions' })
    }
  },
)
// endregion

// region question slice
const questionSlice = createSlice({
  name: 'question',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    const pending = (state: QuestionState) => {
      state.isLoading = true
      state.error = null
    }
    const rejected = (state: QuestionState, action: any) => {
      state.isLoading = false
      state.error = action.payload as Record<string, string>
    }
    const fulfilled = (state: QuestionState) => {
      state.isLoading = false
    }

    builder
      .addCase(addQuestionToSurvey.pending, pending)
      .addCase(addQuestionToSurvey.fulfilled, fulfilled)
      .addCase(addQuestionToSurvey.rejected, rejected)

      .addCase(updateQuestionDetails.pending, pending)
      .addCase(updateQuestionDetails.fulfilled, fulfilled)
      .addCase(updateQuestionDetails.rejected, rejected)

      .addCase(deleteQuestionFromSurvey.pending, pending)
      .addCase(deleteQuestionFromSurvey.fulfilled, fulfilled)
      .addCase(deleteQuestionFromSurvey.rejected, rejected)

      .addCase(reorderSurveyQuestions.pending, pending)
      .addCase(reorderSurveyQuestions.fulfilled, fulfilled)
      .addCase(reorderSurveyQuestions.rejected, rejected)
  },
})
// endregion

// region exports
export const { clearError } = questionSlice.actions
export default questionSlice.reducer
// endregion
