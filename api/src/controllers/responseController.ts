// region imports
import type { Context } from 'hono'

import {
  createResponse,
  findResponsesBySurveyId,
  findSurveyById,
} from '../queries'

import { generateId } from '../utils/generators'

import type {
  ApiResponse,
  SurveyResponse,
} from '../types'
// endregion

// region submit response

export const submitSurveyResponse = async (
  c: Context,
): Promise<Response> => {
  try {
    const db = c.env.DB

    const surveyId = c.req.param('surveyId') || ''

    // validate survey id
    if (!surveyId) {
      return c.json<ApiResponse<null>>(
        {
          success: false,
          message: 'Invalid survey ID',
        },
        400,
      )
    }

    // fetch survey
    const survey = await findSurveyById(
      db,
      surveyId,
    )

    if (!survey) {
      return c.json<ApiResponse<null>>(
        {
          success: false,
          message: 'Survey not found',
        },
        404,
      )
    }

    const body = (await c.req.json()) as {
      answers: {
        questionId: string
        value: string | string[] | number
      }[]
    }

    // validate answers payload
    if (!Array.isArray(body.answers)) {
      return c.json<ApiResponse<null>>(
        {
          success: false,
          message: 'Invalid request',
          errors: {
            answers: 'answers must be an array',
          },
        },
        400,
      )
    }

    // create survey response
    const response = await createResponse(db, {
      id: generateId(),
      surveyId,
      answers: body.answers,
    })

    if (!response) {
      return c.json<ApiResponse<null>>(
        {
          success: false,
          message: 'Failed to submit response',
        },
        500,
      )
    }

    return c.json<ApiResponse<SurveyResponse>>(
      {
        success: true,
        message: 'Response submitted',
        data: response,
      },
      201,
    )
  } catch (error) {
    console.error('Submit response error:', error)

    return c.json<ApiResponse<null>>(
      {
        success: false,
        message: 'Internal server error',
      },
      500,
    )
  }
}

// endregion

// region get responses

export const getSurveyResponses = async (
  c: Context,
): Promise<Response> => {
  try {
    const db = c.env.DB
    const user = c.get('user')

    const surveyId = c.req.param('surveyId') || ''

    // validate survey id
    if (!surveyId) {
      return c.json<ApiResponse<null>>(
        {
          success: false,
          message: 'Invalid survey ID',
        },
        400,
      )
    }

    // fetch survey
    const survey = await findSurveyById(
      db,
      surveyId,
    )

    if (!survey) {
      return c.json<ApiResponse<null>>(
        {
          success: false,
          message: 'Survey not found',
        },
        404,
      )
    }

    // validate survey ownership
    if (survey.userId !== user.userId) {
      return c.json<ApiResponse<null>>(
        {
          success: false,
          message: 'Forbidden',
        },
        403,
      )
    }

    // fetch survey responses
    const responses = await findResponsesBySurveyId(
      db,
      surveyId,
    )

    return c.json<ApiResponse<SurveyResponse[]>>(
      {
        success: true,
        message: 'Responses retrieved',
        data: responses,
      },
      200,
    )
  } catch (error) {
    console.error('Get responses error:', error)

    return c.json<ApiResponse<null>>(
      {
        success: false,
        message: 'Internal server error',
      },
      500,
    )
  }
}

// endregion