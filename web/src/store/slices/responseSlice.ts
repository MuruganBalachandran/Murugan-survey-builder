// region imports
import {
  createAsyncThunk,
  createSlice,
} from '@reduxjs/toolkit'

import * as responseAPI from '@/services/api/responses'

import type {
  SurveyResponse,
  Answer,
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