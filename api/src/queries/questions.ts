// region imports
import type { Question } from "../types";
// endregion

const QUESTION_COLUMNS =
  "id, survey_id, type, ui_type, title, description, options, required, order_index, min_length, max_length, visible_if, created_at, updated_at";

const mapQuestion = (row: any): Question => ({
  id: row.id,
  surveyId: row.survey_id,
  type: row.type,
  uiType: row.ui_type ?? undefined,
  title: row.title,
  description: row.description ?? undefined,
  options: row.options ? JSON.parse(row.options) : undefined,
  required: row.required === 1,
  order: row.order_index,
  minLength: row.min_length ?? undefined,
  maxLength: row.max_length ?? undefined,
  visibleIf: row.visible_if ? JSON.parse(row.visible_if) : undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

// region createQuestion
export const createQuestion = async (
  db: D1Database,
  question: Omit<Question, "createdAt" | "updatedAt">,
): Promise<Question | undefined> => {
  try {
    const now = new Date().toISOString();
    await db
      .prepare(
        "INSERT INTO questions (id, survey_id, type, ui_type, title, description, options, required, order_index, min_length, max_length, visible_if, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      )
      .bind(
        question.id,
        question.surveyId,
        question.type,
        question.uiType ?? null,
        question.title,
        question.description ?? null,
        question.options ? JSON.stringify(question.options) : null,
        question.required ? 1 : 0,
        question.order,
        question.minLength ?? null,
        question.maxLength ?? null,
        question.visibleIf ? JSON.stringify(question.visibleIf) : null,
        now,
        now,
      )
      .run();

    return { ...question, createdAt: now, updatedAt: now };
  } catch (error) {
    console.error("createQuestion error:", error);
    return undefined;
  }
};
// endregion

// region findQuestionsBysurveyId
export const findQuestionsBysurveyId = async (
  db: D1Database,
  surveyId: string,
): Promise<Question[]> => {
  try {
    const results = await db
      .prepare(
        `SELECT ${QUESTION_COLUMNS} FROM questions WHERE survey_id = ? ORDER BY order_index ASC`,
      )
      .bind(surveyId)
      .all<any>();

    return results.results.map(mapQuestion);
  } catch (error) {
    console.error("findQuestionsBysurveyId error:", error);
    return [];
  }
};
// endregion

// region findQuestionById
export const findQuestionById = async (
  db: D1Database,
  id: string,
): Promise<Question | undefined> => {
  try {
    const result = await db
      .prepare(`SELECT ${QUESTION_COLUMNS} FROM questions WHERE id = ?`)
      .bind(id)
      .first<any>();

    return result ? mapQuestion(result) : undefined;
  } catch (error) {
    console.error("findQuestionById error:", error);
    return undefined;
  }
};
// endregion

// region updateQuestion
export const updateQuestion = async (
  db: D1Database,
  id: string,
  updates: Partial<Omit<Question, "id" | "surveyId" | "createdAt">>,
): Promise<Question | null> => {
  try {
    const now = new Date().toISOString();
    const fields: string[] = ["updated_at = ?"];
    const values: any[] = [now];

    if (updates.type !== undefined) { fields.push("type = ?"); values.push(updates.type); }
    if (updates.uiType !== undefined) { fields.push("ui_type = ?"); values.push(updates.uiType); }
    if (updates.title !== undefined) { fields.push("title = ?"); values.push(updates.title); }
    if (updates.description !== undefined) { fields.push("description = ?"); values.push(updates.description); }
    if (updates.options !== undefined) { fields.push("options = ?"); values.push(JSON.stringify(updates.options)); }
    if (updates.required !== undefined) { fields.push("required = ?"); values.push(updates.required ? 1 : 0); }
    if (updates.order !== undefined) { fields.push("order_index = ?"); values.push(updates.order); }
    if (updates.minLength !== undefined) { fields.push("min_length = ?"); values.push(updates.minLength); }
    if (updates.maxLength !== undefined) { fields.push("max_length = ?"); values.push(updates.maxLength); }
    if (updates.visibleIf !== undefined) { fields.push("visible_if = ?"); values.push(updates.visibleIf ? JSON.stringify(updates.visibleIf) : null); }

    values.push(id);

    const row = await db
      .prepare(`UPDATE questions SET ${fields.join(", ")} WHERE id = ? RETURNING ${QUESTION_COLUMNS}`)
      .bind(...values)
      .first<any>();

    return row ? mapQuestion(row) : null;
  } catch (error) {
    console.error("updateQuestion error:", error);
    return null;
  }
};
// endregion

// region deleteQuestion
export const deleteQuestion = async (db: D1Database, id: string): Promise<boolean> => {
  try {
    await db.prepare("DELETE FROM questions WHERE id = ?").bind(id).run();
    return true;
  } catch (error) {
    console.error("deleteQuestion error:", error);
    return false;
  }
};
// endregion

// region reorderQuestions
export const reorderQuestions = async (
  db: D1Database,
  surveyId: string,
  questionIds: string[],
): Promise<boolean> => {
  try {
    const statements = questionIds.map((qId, index) =>
      db.prepare("UPDATE questions SET order_index = ? WHERE id = ? AND survey_id = ?").bind(index, qId, surveyId),
    );
    await db.batch(statements);
    return true;
  } catch (error) {
    console.error("reorderQuestions error:", error);
    return false;
  }
};
// endregion
