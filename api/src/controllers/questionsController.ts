// region imports
import type { Context } from 'hono'

import {
  createQuestion,
  deleteQuestion,
  findQuestionById,
  findQuestionsBysurveyId,
  findSurveyById,
  reorderQuestions,
  updateQuestion,
} from '../queries'

import { generateId } from '../utils/generators'

import type {
  ApiResponse,
  Question,
} from '../types'
// endregion

// region add question

export const addQuestion = async (
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
    const survey = await findSurveyById(db, surveyId)

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

    const body = (await c.req.json()) as {
      type:
        | 'short_text'
        | 'long_text'
        | 'multiple_choice'
        | 'rating'
        | 'yes_no'

      uiType?:
        | 'input'
        | 'textarea'
        | 'radio'
        | 'checkbox_group'
        | 'select'
        | 'buttons'
        | 'toggle'

      title: string
      description?: string
      options?: string[]
      required?: boolean
    }

    // validate question data
    const { validateQuestion } = await import('../utils')

    const validationErrors = validateQuestion(body)

    if (Object.keys(validationErrors).length > 0) {
      return c.json<ApiResponse<null>>(
        {
          success: false,
          message: 'Validation failed',
          errors: validationErrors,
        },
        400,
      )
    }

    // fetch existing questions
    const existingQuestions = await findQuestionsBysurveyId(
      db,
      surveyId,
    )

    // create question
    const question = await createQuestion(db, {
      id: generateId(),
      surveyId,
      type: body.type,
      uiType: body.uiType,
      title: body.title,
      description: body.description,
      options: body.options,
      required: body.required ?? false,
      order: existingQuestions.length,
    })

    if (!question) {
      return c.json<ApiResponse<null>>(
        {
          success: false,
          message: 'Failed to create question',
        },
        500,
      )
    }

    return c.json<ApiResponse<Question>>(
      {
        success: true,
        message: 'Question added',
        data: question,
      },
      201,
    )
  } catch (error) {
    console.error('Add question error:', error)

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

// region update question

export const updateQuestionDetails = async (
  c: Context,
): Promise<Response> => {
  try {
    const db = c.env.DB
    const user = c.get('user')

    const surveyId = c.req.param('surveyId') || ''
    const questionId = c.req.param('questionId') || ''

    // validate route params
    if (!surveyId || !questionId) {
      return c.json<ApiResponse<null>>(
        {
          success: false,
          message: 'Invalid survey or question ID',
        },
        400,
      )
    }

    // fetch survey
    const survey = await findSurveyById(db, surveyId)

    // validate survey ownership
    if (!survey || survey.userId !== user.userId) {
      return c.json<ApiResponse<null>>(
        {
          success: false,
          message: 'Forbidden',
        },
        403,
      )
    }

    const body = (await c.req.json()) as {
      type?:
        | 'short_text'
        | 'long_text'
        | 'multiple_choice'
        | 'rating'
        | 'yes_no'

      uiType?:
        | 'input'
        | 'textarea'
        | 'radio'
        | 'checkbox_group'
        | 'select'
        | 'buttons'
        | 'toggle'

      title?: string
      description?: string
      options?: string[]
      required?: boolean
    }

    // fetch existing question
    const existingQuestion = await findQuestionById(
      db,
      questionId,
    )

    if (!existingQuestion) {
      return c.json<ApiResponse<null>>(
        {
          success: false,
          message: 'Question not found',
        },
        404,
      )
    }

    // validate updated question data
    const { validateQuestion } = await import('../utils')

    const questionToValidate = {
      type: body.type ?? existingQuestion.type,
      title: body.title ?? existingQuestion.title,
      description:
        body.description ?? existingQuestion.description,
      options: body.options ?? existingQuestion.options,
    }

    const validationErrors = validateQuestion(
      questionToValidate,
    )

    if (Object.keys(validationErrors).length > 0) {
      return c.json<ApiResponse<null>>(
        {
          success: false,
          message: 'Validation failed',
          errors: validationErrors,
        },
        400,
      )
    }

    // update question
    const updatedQuestion = await updateQuestion(
      db,
      questionId,
      body,
    )

    if (!updatedQuestion) {
      return c.json<ApiResponse<null>>(
        {
          success: false,
          message: 'Question not found',
        },
        404,
      )
    }

    return c.json<ApiResponse<Question>>(
      {
        success: true,
        message: 'Question updated',
        data: updatedQuestion,
      },
      200,
    )
  } catch (error) {
    console.error('Update question error:', error)

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

// region delete question

export const deleteQuestionById = async (
  c: Context,
): Promise<Response> => {
  try {
    const db = c.env.DB
    const user = c.get('user')

    const surveyId = c.req.param('surveyId') || ''
    const questionId = c.req.param('questionId') || ''

    // validate route params
    if (!surveyId || !questionId) {
      return c.json<ApiResponse<null>>(
        {
          success: false,
          message: 'Invalid survey or question ID',
        },
        400,
      )
    }

    // fetch survey
    const survey = await findSurveyById(db, surveyId)

    // validate survey ownership
    if (!survey || survey.userId !== user.userId) {
      return c.json<ApiResponse<null>>(
        {
          success: false,
          message: 'Forbidden',
        },
        403,
      )
    }

    // delete question
    const deleted = await deleteQuestion(db, questionId)

    if (!deleted) {
      return c.json<ApiResponse<null>>(
        {
          success: false,
          message: 'Question not found',
        },
        404,
      )
    }

    return c.json<ApiResponse<null>>(
      {
        success: true,
        message: 'Question deleted',
      },
      200,
    )
  } catch (error) {
    console.error('Delete question error:', error)

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

// region reorder questions

export const reorderSurveyQuestions = async (
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
    const survey = await findSurveyById(db, surveyId)

    // validate survey ownership
    if (!survey || survey.userId !== user.userId) {
      return c.json<ApiResponse<null>>(
        {
          success: false,
          message: 'Forbidden',
        },
        403,
      )
    }

    const body = (await c.req.json()) as {
      questionIds: string[]
    }

    // validate question ids array
    if (!Array.isArray(body.questionIds)) {
      return c.json<ApiResponse<null>>(
        {
          success: false,
          message: 'Invalid request',
          errors: {
            questionIds: 'questionIds must be an array',
          },
        },
        400,
      )
    }

    // reorder questions
    const reordered = await reorderQuestions(
      db,
      surveyId,
      body.questionIds,
    )

    if (!reordered) {
      return c.json<ApiResponse<null>>(
        {
          success: false,
          message: 'Failed to reorder questions',
        },
        500,
      )
    }

    // fetch updated question order
    const questions = await findQuestionsBysurveyId(
      db,
      surveyId,
    )

    return c.json<ApiResponse<Question[]>>(
      {
        success: true,
        message: 'Questions reordered',
        data: questions,
      },
      200,
    )
  } catch (error) {
    console.error('Reorder questions error:', error)

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