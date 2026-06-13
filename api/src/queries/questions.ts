// region imports
import type { Question } from '../types'
// endregion

// region create question
export const createQuestion = async (
  db: D1Database,
  question: Omit<Question, 'createdAt' | 'updatedAt'>,
): Promise<Question | undefined> => {
  try {
    const now = new Date().toISOString()

    await db
      .prepare(
        'INSERT INTO questions (id, survey_id, type, ui_type, title, description, options, required, order_index, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      )
      .bind(
        question.id,
        question.surveyId,
        question.type,
        question.uiType || null,
        question.title,
        question.description || null,
        question.options ? JSON.stringify(question.options) : null,
        question.required ? 1 : 0,
        question.order,
        now,
        now,
      )
      .run()

    return {
      ...question,
      createdAt: now,
      updatedAt: now,
    }
  } catch (error) {
    console.error('Create question error:', error)
    return undefined
  }
}
// endregion


// region find questions
export const findQuestionsBysurveyId = async (
  db: D1Database,
  surveyId: string,
): Promise<Question[]> => {
  try {
    const results = await db
      .prepare('SELECT * FROM questions WHERE survey_id = ? ORDER BY order_index ASC')
      .bind(surveyId)
      .all<any>()

    return results.results.map((result) => ({
      id: result.id,
      surveyId: result.survey_id,
      type: result.type,
      uiType: result.ui_type || undefined,
      title: result.title,
      description: result.description,
      options: result.options ? JSON.parse(result.options) : undefined,
      required: result.required === 1,
      order: result.order_index,
      createdAt: result.created_at,
      updatedAt: result.updated_at,
    }))
  } catch (error) {
    console.error('Find questions by survey id error:', error)
    return []
  }
}
// endregion

// region find question
export const findQuestionById = async (
  db: D1Database,
  id: string,
): Promise<Question | undefined> => {
  try {
    const result = await db
      .prepare('SELECT * FROM questions WHERE id = ?')
      .bind(id)
      .first<any>()

    if (!result) return undefined

    return {
      id: result.id,
      surveyId: result.survey_id,
      type: result.type,
      uiType: result.ui_type || undefined,
      title: result.title,
      description: result.description,
      options: result.options ? JSON.parse(result.options) : undefined,
      required: result.required === 1,
      order: result.order_index,
      createdAt: result.created_at,
      updatedAt: result.updated_at,
    }
  } catch (error) {
    console.error('Find question by id error:', error)
    return undefined
  }
}
// endregion

// region update question
export const updateQuestion = async (
  db: D1Database,
  id: string,
  updates: Partial<Omit<Question, 'id' | 'surveyId' | 'createdAt'>>,
): Promise<Question | null> => {
  try {
    const question = await findQuestionById(db, id)
    if (!question) return null

    const now = new Date().toISOString()

    await db
      .prepare(
        'UPDATE questions SET type = ?, ui_type = ?, title = ?, description = ?, options = ?, required = ?, updated_at = ? WHERE id = ?',
      )
      .bind(
        updates.type ?? question.type,
        updates.uiType ?? question.uiType ?? null,
        updates.title ?? question.title,
        updates.description ?? question.description,
        updates.options ? JSON.stringify(updates.options) : question.options ? JSON.stringify(question.options) : null,
        updates.required !== undefined ? (updates.required ? 1 : 0) : (question.required ? 1 : 0),
        now,
        id,
      )
      .run()

    return {
      ...question,
      ...updates,
      type: updates.type ?? question.type,
      uiType: updates.uiType ?? question.uiType,
      updatedAt: now,
    }
  } catch (error) {
    console.error('Update question error:', error)
    return null
  }
}
// endregion

// region delete question
export const deleteQuestion = async (db: D1Database, id: string): Promise<boolean> => {
  try {
    await db.prepare('DELETE FROM questions WHERE id = ?').bind(id).run()
    return true
  } catch (error) {
    console.error('Delete question error:', error)
    return false
  }
}
// endregion

// region reorder
export const reorderQuestions = async (
  db: D1Database,
  surveyId: string,
  questionIds: string[],
): Promise<boolean> => {
  try {
    const statements = questionIds.map((id, index) =>
      db.prepare('UPDATE questions SET order_index = ? WHERE id = ?').bind(index, id),
    )

    await db.batch(statements)
    return true
  } catch (error) {
    console.error('Reorder questions error:', error)
    return false
  }
}
// endregion