// region imports
import type { Context } from 'hono'
import {
  createSurvey,
  deleteSurvey,
  findQuestionsBysurveyId,
  findSurveyById,
  findSurveyBySlug,
  findSurveysByUserId,
  findSurveysByUserIdPaginated,
  updateSurvey,
} from '../queries'
import { generateId, generateSlug } from '../utils/generators'
import type { ApiResponse, Survey, SurveyWithQuestions } from '../types'
// endregion

// region create survey
export const createNewSurvey = async (c: Context): Promise<Response> => {
  try {
    const db = c.env.DB
    const user = c.get('user')

    const body = (await c.req.json()) as { title: string; description?: string }
    const { title, description } = body

    // Validate title only - description is optional
    const { validateSurveyTitle } = await import('../utils')
    const titleError = validateSurveyTitle(title)
    if (titleError) {
      return c.json<ApiResponse<null>>(
        { success: false, message: 'Validation failed', errors: { [titleError.field]: titleError.message } },
        400,
      )
    }

    // generate slug and ensure uniqueness
    const slug = generateSlug(title)
    const survey = await createSurvey(db, {
      id: generateId(),
      userId: user.userId,
      title: title.trim(),
      description: description?.trim(),
      slug,
      primaryColor: '#6366F1',
      logoUrl: undefined,
      status: 'draft',
    })

    if (!survey) {
      return c.json<ApiResponse<null>>({ success: false, message: 'Failed to create survey' }, 500)
    }

    return c.json<ApiResponse<Survey>>({ success: true, message: 'Survey created', data: survey }, 201)
  } catch (error) {
    console.error('Create survey error:', error)
    return c.json<ApiResponse<null>>({ success: false, message: 'Internal server error' }, 500)
  }
}
// endregion

// region get user surveys
export const getUserSurveys = async (c: Context): Promise<Response> => {
  try {
    const db = c.env.DB
    const user = c.get('user')

    const page = Math.max(1, Number(c.req.query('page') ?? 1))
    const pageSize = Math.min(50, Math.max(1, Number(c.req.query('pageSize') ?? 6)))
    const search = c.req.query('search') ?? ''
    const status = c.req.query('status') ?? 'all'
    const dateRange = c.req.query('dateRange') ?? 'all'
    const sort = c.req.query('sort') ?? 'newest'

    const { surveys, total } = await findSurveysByUserIdPaginated(db, user.userId, {
      page,
      pageSize,
      search,
      status,
      dateRange,
      sort,
    })

    return c.json<ApiResponse<{ surveys: Survey[]; total: number; page: number; pageSize: number }>>(
      { success: true, message: 'Surveys retrieved', data: { surveys, total, page, pageSize } },
      200,
    )
  } catch (error) {
    console.error('Get surveys error:', error)
    return c.json<ApiResponse<null>>({ success: false, message: 'Internal server error' }, 500)
  }
}
// endregion

// region get survey by id

export const getSurveyById = async (c: Context): Promise<Response> => {
  try {
    // get db and user details
    const db = c.env.DB
    const user = c.get('user')

    // check id
    const id = c.req.param('id') || ''
    if (!id) {
      return c.json<ApiResponse<null>>({ success: false, message: 'Invalid survey ID' }, 400)
    }

    // find survey
    const survey = await findSurveyById(db, id)

    // if survey not found
    if (!survey) {
      return c.json<ApiResponse<null>>({ success: false, message: 'Survey not found' }, 404)
    }

    // check whether the survey is users id
    if (survey.userId !== user.userId) {
      return c.json<ApiResponse<null>>({ success: false, message: 'Forbidden' }, 403)
    }

    // get questions and return
    const questions = await findQuestionsBysurveyId(db, id)
    const surveyWithQuestions: SurveyWithQuestions = { ...survey, questions }

    return c.json<ApiResponse<SurveyWithQuestions>>(
      { success: true, message: 'Survey retrieved', data: surveyWithQuestions },
      200,
    )
  } catch (error) {
    console.error('Get survey error:', error)
    return c.json<ApiResponse<null>>({ success: false, message: 'Internal server error' }, 500)
  }
}
// endregion

// region get public survey

export const getPublicSurvey = async (c: Context): Promise<Response> => {
  try {
    // get db details
    const db = c.env.DB
    const slug = c.req.param('slug') || ''
    if (!slug) {
      return c.json<ApiResponse<null>>({ success: false, message: 'Invalid survey slug' }, 400)
    }

    // find survey
    const survey = await findSurveyBySlug(db, slug)

    // if survey not found
    if (!survey) {
      return c.json<ApiResponse<null>>({ success: false, message: 'Survey not found' }, 404)
    }

    // find questions
    const questions = await findQuestionsBysurveyId(db, survey.id)
    const surveyWithQuestions: SurveyWithQuestions = { ...survey, questions }

    return c.json<ApiResponse<SurveyWithQuestions>>(
      { success: true, message: 'Survey retrieved', data: surveyWithQuestions },
      200,
    )
  } catch (error) {
    console.error('Get public survey error:', error)
    return c.json<ApiResponse<null>>({ success: false, message: 'Internal server error' }, 500)
  }
}
// endregion

// region update survey
// update survey
export const updateSurveyDetails = async (c: Context): Promise<Response> => {
  try {
    // get db and user details
    const db = c.env.DB
    const user = c.get('user')

    // validate id
    const id = c.req.param('id') || ''
    if (!id) {
      return c.json<ApiResponse<null>>({ success: false, message: 'Invalid survey ID' }, 400)
    }

    // get survey
    const survey = await findSurveyById(db, id)

    if (!survey) {
      return c.json<ApiResponse<null>>({ success: false, message: 'Survey not found' }, 404)
    }

    // check the survey for curr user
    if (survey.userId !== user.userId) {
      return c.json<ApiResponse<null>>({ success: false, message: 'Forbidden' }, 403)
    }

    // payload
    const body = (await c.req.json()) as {
      title?: string
      description?: string
      primaryColor?: string
      logoUrl?: string
      status?: 'draft' | 'published' | 'closed' | 'archived'
      publishedAt?: string
    }

    // Validate updates
    const { validateSurveyUpdate } = await import('../utils')
    const validationErrors = validateSurveyUpdate(body)
    if (Object.keys(validationErrors).length > 0) {
      return c.json<ApiResponse<null>>(
        { success: false, message: 'Validation failed', errors: validationErrors },
        400,
      )
    }

    // perform update query
    const updatedSurvey = await updateSurvey(db, id, {
      title: body.title || survey.title,
      description: body.description !== undefined ? body.description : survey.description,
      primaryColor: body.primaryColor || survey.primaryColor,
      logoUrl: body.logoUrl !== undefined ? body.logoUrl : survey.logoUrl,
      status: body.status || survey.status,
      publishedAt: body.publishedAt !== undefined ? body.publishedAt : survey.publishedAt,
      slug: survey.slug,
    })

    // if failed
    if (!updatedSurvey) {
      return c.json<ApiResponse<null>>({ success: false, message: 'Failed to update survey' }, 500)
    }

    return c.json<ApiResponse<Survey>>({ success: true, message: 'Survey updated', data: updatedSurvey }, 200)
  } catch (error) {
    console.error('Update survey error:', error)
    return c.json<ApiResponse<null>>({ success: false, message: 'Internal server error' }, 500)
  }
}
// endregion

// region delete survey
// delete a survey
export const deleteSurveyById = async (c: Context): Promise<Response> => {
  try {
    // get db and user details
    const db = c.env.DB
    const user = c.get('user')

    const id = c.req.param('id') || ''
    if (!id) {
      return c.json<ApiResponse<null>>({ success: false, message: 'Invalid survey ID' }, 400)
    }

    // find survey
    const survey = await findSurveyById(db, id)

    if (!survey) {
      return c.json<ApiResponse<null>>({ success: false, message: 'Survey not found' }, 404)
    }

    // check the survey on curr user
    if (survey.userId !== user.userId) {
      return c.json<ApiResponse<null>>({ success: false, message: 'Forbidden' }, 403)
    }

    // perform delete
    const deleted = await deleteSurvey(db, id)

    if (!deleted) {
      return c.json<ApiResponse<null>>({ success: false, message: 'Failed to delete survey' }, 500)
    }

    return c.json<ApiResponse<null>>({ success: true, message: 'Survey deleted' }, 200)
  } catch (error) {
    console.error('Delete survey error:', error)
    return c.json<ApiResponse<null>>({ success: false, message: 'Internal server error' }, 500)
  }
}
// endregion

