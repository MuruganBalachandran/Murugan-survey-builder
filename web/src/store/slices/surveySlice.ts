import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import * as surveyAPI from '@/services/api/surveys'
import type { Survey, SurveyWithQuestions } from '@/types/survey'

export interface SurveyState {
  surveys: Survey[]
  currentSurvey: SurveyWithQuestions | null
  isLoading: boolean
  error: Record<string, string> | null
}

const initialState: SurveyState = {
  surveys: [],
  currentSurvey: null,
  isLoading: false,
  error: null,
}

// region create survey
export const createNewSurvey = createAsyncThunk(
  'survey/createNewSurvey',
  async (data: { title: string; description?: string }, { rejectWithValue }) => {
    try {
      const response = await surveyAPI.createSurvey(data.title, data.description)
      if (!response.success || !response.data) {
        return rejectWithValue(response.errors || { general: response.message })
      }
      return response.data
    } catch (error: any) {
      return rejectWithValue({ general: error.message || 'Failed to create survey' })
    }
  },
)
// endregion

// region fetch user surveys
export const fetchUserSurveys = createAsyncThunk('survey/fetchUserSurveys', async (_, { rejectWithValue }) => {
  try {
    const response = await surveyAPI.getUserSurveys()
    if (!response.success || !response.data) {
      return rejectWithValue(response.errors || { general: response.message })
    }
    return response.data
  } catch (error: any) {
    return rejectWithValue({ general: error.message || 'Failed to fetch surveys' })
  }
})
// endregion

// region fetch survey by ID
export const fetchSurveyById = createAsyncThunk(
  'survey/fetchSurveyById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await surveyAPI.getSurveyById(id)
      if (!response.success || !response.data) {
        return rejectWithValue(response.errors || { general: response.message })
      }
      return response.data
    } catch (error: any) {
      return rejectWithValue({ general: error.message || 'Failed to fetch survey' })
    }
  },
)
// endregion

// region update survey details
export const updateSurveyDetails = createAsyncThunk(
  'survey/updateSurveyDetails',
  async (
    data: {
      id: string
      title?: string
      description?: string
      primaryColor?: string
      logoUrl?: string
      status?: 'draft' | 'published' | 'closed' | 'archived'
      publishedAt?: string
    },
    { rejectWithValue },
  ) => {
    try {
      const { id, ...updates } = data
      const response = await surveyAPI.updateSurvey(id, updates)
      if (!response.success || !response.data) {
        return rejectWithValue(response.errors || { general: response.message })
      }
      return response.data
    } catch (error: any) {
      return rejectWithValue({ general: error.message || 'Failed to update survey' })
    }
  },
)
// endregion

// region delete survey
export const deleteSurveyById = createAsyncThunk(
  'survey/deleteSurveyById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await surveyAPI.deleteSurvey(id)
      if (!response.success) {
        return rejectWithValue(response.errors || { general: response.message })
      }
      return id
    } catch (error: any) {
      return rejectWithValue({ general: error.message || 'Failed to delete survey' })
    }
  },
)
// endregion

const surveySlice = createSlice({
  name: 'survey',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearCurrentSurvey: (state) => {
      state.currentSurvey = null
    },
  },
  extraReducers: (builder) => {
    // region create survey handlers
    builder
      .addCase(createNewSurvey.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createNewSurvey.fulfilled, (state, action) => {
        state.isLoading = false
        state.surveys.push(action.payload)
      })
      .addCase(createNewSurvey.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as Record<string, string>
      })
    // endregion

    // region fetch surveys handlers
    builder
      .addCase(fetchUserSurveys.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchUserSurveys.fulfilled, (state, action) => {
        state.isLoading = false
        state.surveys = action.payload
      })
      .addCase(fetchUserSurveys.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as Record<string, string>
      })
    // endregion

    // region fetch survey by ID handlers
    builder
      .addCase(fetchSurveyById.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchSurveyById.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentSurvey = action.payload
      })
      .addCase(fetchSurveyById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as Record<string, string>
      })
    // endregion

    // region update survey handlers
    builder
      .addCase(updateSurveyDetails.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateSurveyDetails.fulfilled, (state, action) => {
        state.isLoading = false
        if (state.currentSurvey) {
          state.currentSurvey = { ...state.currentSurvey, ...action.payload }
        }
        const index = state.surveys.findIndex((s) => s.id === action.payload.id)
        if (index !== -1) {
          state.surveys[index] = action.payload
        }
      })
      .addCase(updateSurveyDetails.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as Record<string, string>
      })
    // endregion

    // region delete survey handlers
    builder
      .addCase(deleteSurveyById.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteSurveyById.fulfilled, (state, action) => {
        state.isLoading = false
        state.surveys = state.surveys.filter((s) => s.id !== action.payload)
      })
      .addCase(deleteSurveyById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as Record<string, string>
      })
    // endregion
  },
})

export const { clearError, clearCurrentSurvey } = surveySlice.actions
export default surveySlice.reducer
