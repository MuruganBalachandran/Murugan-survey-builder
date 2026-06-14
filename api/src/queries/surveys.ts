// region m=imports
import type { Question, Survey, SurveyResponse } from '../types'

// region create survey
export const createSurvey = async (
  db: D1Database,
  survey: Omit<Survey, 'createdAt' | 'updatedAt' | 'responseCount' | 'questionCount'>,
): Promise<Survey | undefined> => {
  try {
    const now = new Date().toISOString()

    await db
      .prepare(
        'INSERT INTO surveys (id, user_id, title, description, slug, primary_color, logo_url, status, published_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      )
      .bind(
        survey.id,
        survey.userId,
        survey.title,
        survey.description || null,
        survey.slug,
        survey.primaryColor,
        survey.logoUrl || null,
        survey.status || 'draft',
        survey.publishedAt || null,
        now,
        now,
      )
      .run()

    return {
      ...survey,
      createdAt: now,
      updatedAt: now,
      responseCount: 0,
      questionCount: 0,
    }
  } catch (error) {
    console.error('Create survey error:', error)
    return undefined
  }
}
// endregion

// region find survey
export const findSurveyById = async (
  db: D1Database,
  id: string,
): Promise<Survey | undefined> => {
  try {
    const result = await db
      .prepare(
        `SELECT s.*,
          (SELECT COUNT(*) FROM survey_responses r WHERE r.survey_id = s.id) AS response_count,
          (SELECT COUNT(*) FROM questions q WHERE q.survey_id = s.id) AS question_count
        FROM surveys s
        WHERE s.id = ?`,
      )
      .bind(id)
      .first<any>()

    if (!result) return undefined

    return {
      id: result.id,
      userId: result.user_id,
      title: result.title,
      description: result.description,
      slug: result.slug,
      primaryColor: result.primary_color,
      logoUrl: result.logo_url,
      status: result.status,
      publishedAt: result.published_at,
      createdAt: result.created_at,
      updatedAt: result.updated_at,
      responseCount: Number(result.response_count ?? 0),
      questionCount: Number(result.question_count ?? 0),
    }
  } catch (error) {
    console.error('Find survey by id error:', error)
    return undefined
  }
}
// endregion

// region find survey
export const findSurveyBySlug = async (
  db: D1Database,
  slug: string,
): Promise<Survey | undefined> => {
  try {
    const result = await db
      .prepare(
        `SELECT s.*,
          (SELECT COUNT(*) FROM survey_responses r WHERE r.survey_id = s.id) AS response_count,
          (SELECT COUNT(*) FROM questions q WHERE q.survey_id = s.id) AS question_count
        FROM surveys s
        WHERE s.slug = ?`,
      )
      .bind(slug)
      .first<any>()

    if (!result) return undefined

    return {
      id: result.id,
      userId: result.user_id,
      title: result.title,
      description: result.description,
      slug: result.slug,
      primaryColor: result.primary_color,
      logoUrl: result.logo_url,
      status: result.status,
      publishedAt: result.published_at,
      createdAt: result.created_at,
      updatedAt: result.updated_at,
      responseCount: Number(result.response_count ?? 0),
      questionCount: Number(result.question_count ?? 0),
    }
  } catch (error) {
    console.error('Find survey by slug error:', error)
    return undefined
  }
}
// endregion

// region find survey by id
export const findSurveysByUserId = async (
  db: D1Database,
  userId: string,
): Promise<Survey[]> => {
  try {
    const results = await db
      .prepare(
        `SELECT s.*,
          (SELECT COUNT(*) FROM survey_responses r WHERE r.survey_id = s.id) AS response_count,
          (SELECT COUNT(*) FROM questions q WHERE q.survey_id = s.id) AS question_count
        FROM surveys s
        WHERE s.user_id = ?
        ORDER BY s.created_at DESC`,
      )
      .bind(userId)
      .all<any>()

    return results.results.map((result) => ({
      id: result.id,
      userId: result.user_id,
      title: result.title,
      description: result.description,
      slug: result.slug,
      primaryColor: result.primary_color,
      logoUrl: result.logo_url,
      status: result.status,
      publishedAt: result.published_at,
      createdAt: result.created_at,
      updatedAt: result.updated_at,
      responseCount: Number(result.response_count ?? 0),
      questionCount: Number(result.question_count ?? 0),
    }))
  } catch (error) {
    console.error('Find surveys by user id error:', error)
    return []
  }
}
// endregion

// region find surveys paginated
export interface SurveyListParams {
  page: number
  pageSize: number
  search?: string
  status?: string
  dateRange?: string
  sort?: string
}

export const findSurveysByUserIdPaginated = async (
  db: D1Database,
  userId: string,
  params: SurveyListParams,
): Promise<{ surveys: Survey[]; total: number }> => {
  try {
    const { page, pageSize, search = '', status = 'all', dateRange = 'all', sort = 'newest' } = params
    const offset = (page - 1) * pageSize

    // build WHERE clauses dynamically
    const conditions: string[] = ['s.user_id = ?']
    const bindings: any[] = [userId]

    if (status !== 'all') {
      conditions.push('s.status = ?')
      bindings.push(status)
    }

    if (search.trim()) {
      conditions.push('(s.title LIKE ? OR s.description LIKE ? OR s.slug LIKE ?)')
      const term = `%${search.trim()}%`
      bindings.push(term, term, term)
    }

    if (dateRange === '7d') {
      conditions.push("s.created_at >= datetime('now', '-7 days')")
    } else if (dateRange === '30d') {
      conditions.push("s.created_at >= datetime('now', '-30 days')")
    }

    const orderClause =
      sort === 'oldest' ? 's.created_at ASC'
      : sort === 'title' ? 's.title ASC'
      : sort === 'responses' ? 'response_count DESC'
      : 's.created_at DESC'

    const where = conditions.join(' AND ')
    const baseSelect = `
      SELECT s.*,
        (SELECT COUNT(*) FROM survey_responses r WHERE r.survey_id = s.id) AS response_count,
        (SELECT COUNT(*) FROM questions q WHERE q.survey_id = s.id) AS question_count
      FROM surveys s
      WHERE ${where}`

    const [countResult, listResult] = await Promise.all([
      db.prepare(`SELECT COUNT(*) AS total FROM surveys s WHERE ${where}`).bind(...bindings).first<{ total: number }>(),
      db.prepare(`${baseSelect} ORDER BY ${orderClause} LIMIT ? OFFSET ?`).bind(...bindings, pageSize, offset).all<any>(),
    ])

    const surveys = listResult.results.map((result) => ({
      id: result.id,
      userId: result.user_id,
      title: result.title,
      description: result.description,
      slug: result.slug,
      primaryColor: result.primary_color,
      logoUrl: result.logo_url,
      status: result.status,
      publishedAt: result.published_at,
      createdAt: result.created_at,
      updatedAt: result.updated_at,
      responseCount: Number(result.response_count ?? 0),
      questionCount: Number(result.question_count ?? 0),
    }))

    return { surveys, total: Number(countResult?.total ?? 0) }
  } catch (error) {
    console.error('Find surveys paginated error:', error)
    return { surveys: [], total: 0 }
  }
}
// endregion

// region update survey
export const updateSurvey = async (
  db: D1Database,
  id: string,
  updates: Partial<Omit<Survey, 'id' | 'userId' | 'createdAt'>>,
): Promise<Survey | null> => {
  try {
    const survey = await findSurveyById(db, id)
    if (!survey) return null

    const now = new Date().toISOString()

    await db
      .prepare(
        'UPDATE surveys SET title = ?, description = ?, slug = ?, primary_color = ?, logo_url = ?, status = ?, published_at = ?, updated_at = ? WHERE id = ?',
      )
      .bind(
        updates.title ?? survey.title,
        updates.description ?? survey.description,
        updates.slug ?? survey.slug,
        updates.primaryColor ?? survey.primaryColor,
        updates.logoUrl ?? survey.logoUrl,
        updates.status ?? survey.status,
        updates.publishedAt ?? survey.publishedAt ?? null,
        now,
        id,
      )
      .run()

    return {
      ...survey,
      ...updates,
      status: updates.status ?? survey.status,
      publishedAt: updates.publishedAt ?? survey.publishedAt,
      updatedAt: now,
    }
  } catch (error) {
    console.error('Update survey error:', error)
    return null
  }
}
// endregion

// region delete survey
export const deleteSurvey = async (db: D1Database, id: string): Promise<boolean> => {
  try {
    await db.prepare('DELETE FROM questions WHERE survey_id = ?').bind(id).run()
    await db.prepare('DELETE FROM survey_responses WHERE survey_id = ?').bind(id).run()
    await db.prepare('DELETE FROM surveys WHERE id = ?').bind(id).run()

    return true
  } catch (error) {
    console.error('Delete survey error:', error)
    return false
  }
}
// endregion
