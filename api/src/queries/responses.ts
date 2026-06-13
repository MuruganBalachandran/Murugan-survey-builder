// region imports
import type { SurveyResponse } from '../types'
// endregion

// region create response
export const createResponse = async (
  db: D1Database,
  response: Omit<SurveyResponse, 'submittedAt'>,
): Promise<SurveyResponse | undefined> => {
  try {
    const now = new Date().toISOString()

    await db
      .prepare(
        'INSERT INTO survey_responses (id, survey_id, answers, submitted_at) VALUES (?, ?, ?, ?)',
      )
      .bind(response.id, response.surveyId, JSON.stringify(response.answers), now)
      .run()

    return {
      ...response,
      submittedAt: now,
    }
  } catch (error) {
    console.error('Create response error:', error)
    return undefined
  }
}
// endregion

// region find response
export const findResponseById = async (
  db: D1Database,
  id: string,
): Promise<SurveyResponse | undefined> => {
  try {
    const result = await db
      .prepare('SELECT * FROM survey_responses WHERE id = ?')
      .bind(id)
      .first<any>()

    if (!result) return undefined

    return {
      id: result.id,
      surveyId: result.survey_id,
      answers: JSON.parse(result.answers),
      submittedAt: result.submitted_at,
    }
  } catch (error) {
    console.error('Find response by id error:', error)
    return undefined
  }
}
// endregion

// region find response by survey
export const findResponsesBySurveyId = async (
  db: D1Database,
  surveyId: string,
): Promise<SurveyResponse[]> => {
  try {
    const results = await db
      .prepare('SELECT * FROM survey_responses WHERE survey_id = ? ORDER BY submitted_at DESC')
      .bind(surveyId)
      .all<any>()

    return results.results.map((result) => ({
      id: result.id,
      surveyId: result.survey_id,
      answers: JSON.parse(result.answers),
      submittedAt: result.submitted_at,
    }))
  } catch (error) {
    console.error('Find responses by survey id error:', error)
    return []
  }
}
// endregion
