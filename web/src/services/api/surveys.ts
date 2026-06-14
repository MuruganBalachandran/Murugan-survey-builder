// region imports
import apiClient from './client'
import type {
  Survey,
  SurveyWithQuestions,
} from '@/types/survey'
import type {
  ApiResponse,
} from '@/types/common'
// endregion

// region exports
export type {
  Survey,
  SurveyWithQuestions,
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

// region create survey
export const createSurvey = async (
  title: string,
  description?: string,
): Promise<ApiResponse<Survey>> => {
  try {
    // create new survey
    const response =
      await apiClient.post<ApiResponse<Survey>>(
        '/surveys',
        {
          title,
          description,
        },
      )

    return response.data
  } catch (error: any) {
    return handleApiError(error)
  }
}
// endregion

// region get user surveys
export interface SurveyListParams {
  page?: number
  pageSize?: number
  search?: string
  status?: string
  dateRange?: string
  sort?: string
}

export interface PaginatedSurveys {
  surveys: Survey[]
  total: number
  page: number
  pageSize: number
}

export const getUserSurveys = async (
  params: SurveyListParams = {},
): Promise<ApiResponse<PaginatedSurveys>> => {
  try {
    const response = await apiClient.get<ApiResponse<PaginatedSurveys>>('/surveys', { params })
    return response.data
  } catch (error: any) {
    return handleApiError(error)
  }
}
// endregion

// region get survey by id
export const getSurveyById = async (
  id: string,
): Promise<ApiResponse<SurveyWithQuestions>> => {
  try {
    // fetch survey details
    const response =
      await apiClient.get<
        ApiResponse<SurveyWithQuestions>
      >(`/surveys/${id}`)

    return response.data
  } catch (error: any) {
    return handleApiError(error)
  }
}
// endregion

// region get public survey
export const getPublicSurvey = async (
  slug: string,
): Promise<ApiResponse<SurveyWithQuestions>> => {
  try {
    // fetch public survey
    const response =
      await apiClient.get<
        ApiResponse<SurveyWithQuestions>
      >(`/surveys/public/${slug}`)

    return response.data
  } catch (error: any) {
    return handleApiError(error)
  }
}
// endregion

// region update survey
export const updateSurvey = async (
  id: string,
  data: {
    title?: string
    description?: string
    primaryColor?: string
    logoUrl?: string
    status?:
      | 'draft'
      | 'published'
      | 'closed'
      | 'archived'
    publishedAt?: string
  },
): Promise<ApiResponse<Survey>> => {
  try {
    // update survey details
    const response =
      await apiClient.put<ApiResponse<Survey>>(
        `/surveys/${id}`,
        data,
      )

    return response.data
  } catch (error: any) {
    return handleApiError(error)
  }
}
// endregion

// region delete survey
export const deleteSurvey = async (
  id: string,
): Promise<ApiResponse<null>> => {
  try {
    // delete survey
    const response =
      await apiClient.delete<ApiResponse<null>>(
        `/surveys/${id}`,
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