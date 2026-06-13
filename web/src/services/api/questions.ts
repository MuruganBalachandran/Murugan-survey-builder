// region imports
import apiClient from './client'
import type {
  Question,
  QuestionPayload,
} from '@/types/survey'
import type {
  ApiResponse,
} from '@/types/common'
// endregion

// region exports
export type {
  Question,
  QuestionPayload,
}
export type {
  ApiResponse,
}
// endregion

// region helper functions
// return API error response safely
const handleApiError = (error: any) => {
  if (error.response?.data) {
    return error.response.data
  }

  throw error
}
// endregion

// region add question
export const addQuestion = async (
  surveyId: string,
  data: QuestionPayload,
): Promise<ApiResponse<Question>> => {
  try {
    // create survey question
    const response =
      await apiClient.post<ApiResponse<Question>>(
        `/surveys/${surveyId}/questions`,
        data,
      )

    return response.data
  } catch (error: any) {
    return handleApiError(error)
  }
}
// endregion

// region update question
export const updateQuestion = async (
  surveyId: string,
  questionId: string,
  data: Partial<QuestionPayload>,
): Promise<ApiResponse<Question>> => {
  try {
    // update survey question
    const response =
      await apiClient.put<ApiResponse<Question>>(
        `/surveys/${surveyId}/questions/${questionId}`,
        data,
      )

    return response.data
  } catch (error: any) {
    return handleApiError(error)
  }
}
// endregion

// region delete question
export const deleteQuestion = async (
  surveyId: string,
  questionId: string,
): Promise<ApiResponse<null>> => {
  try {
    // delete survey question
    const response =
      await apiClient.delete<ApiResponse<null>>(
        `/surveys/${surveyId}/questions/${questionId}`,
      )

    return response.data
  } catch (error: any) {
    return handleApiError(error)
  }
}
// endregion

// region reorder questions
export const reorderQuestions = async (
  surveyId: string,
  questionIds: string[],
): Promise<ApiResponse<Question[]>> => {
  try {
    // reorder survey questions
    const response =
      await apiClient.put<ApiResponse<Question[]>>(
        `/surveys/${surveyId}/questions/reorder`,
        {
          questionIds,
        },
      )

    return response.data
  } catch (error: any) {
    return handleApiError(error)
  }
}
// endregion

// region exports
export default apiClient
// endregion
