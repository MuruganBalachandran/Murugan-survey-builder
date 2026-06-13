// region imports
import apiClient from './client'
import type {
  SurveyResponse,
  Answer,
} from '@/types/survey'
import type {
  ApiResponse,
} from '@/types/common'
// endregion

// region exports
export type {
  SurveyResponse,
  Answer,
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

// region submit response
export const submitResponse = async (
  surveyId: string,
  answers: Answer[],
): Promise<ApiResponse<SurveyResponse>> => {
  try {
    // submit public survey response
    const response =
      await apiClient.post<
        ApiResponse<SurveyResponse>
      >(`/surveys/${surveyId}/responses`, {
        answers,
      })

    return response.data
  } catch (error: any) {
    return handleApiError(error)
  }
}
// endregion

// region get survey responses
export const getSurveyResponses = async (
  surveyId: string,
): Promise<ApiResponse<SurveyResponse[]>> => {
  try {
    // fetch survey responses
    const response =
      await apiClient.get<
        ApiResponse<SurveyResponse[]>
      >(`/surveys/${surveyId}/responses`)

    return response.data
  } catch (error: any) {
    return handleApiError(error)
  }
}
// endregion

// region exports
export default apiClient
// endregion
