// region imports
import type { SurveyResponse } from "../types";
// endregion

// Shared column list — avoids SELECT * and makes the mapping explicit
const RESPONSE_COLUMNS = "id, survey_id, answers, submitted_at";

// Maps a raw D1 row to the typed SurveyResponse shape
const mapResponse = (row: any): SurveyResponse => ({
  id: row.id,
  surveyId: row.survey_id,
  answers: JSON.parse(row.answers ?? "[]"),
  submittedAt: row.submitted_at,
});

// region createResponse

export const createResponse = async (
  db: D1Database,
  response: Omit<SurveyResponse, "submittedAt">,
): Promise<SurveyResponse | undefined> => {
  try {
    const now = new Date().toISOString();
    // Inserts a new survey response and returns the persisted record.
    await db
      .prepare(
        "INSERT INTO survey_responses (id, survey_id, answers, submitted_at) VALUES (?, ?, ?, ?)",
      )
      .bind(
        response.id,
        response.surveyId,
        JSON.stringify(response.answers),
        now,
      )
      // sends the query to D1, returns void
      .run();

    return { ...response, submittedAt: now };
  } catch (error) {
    console.error("createResponse error:", error);
    return undefined;
  }
};
// endregion

// region findResponseById
export const findResponseById = async (
  db: D1Database,
  id: string,
): Promise<SurveyResponse | undefined> => {
  try {
    // Fetches a single response by primary key.
    const result = await db
      .prepare(`SELECT ${RESPONSE_COLUMNS} FROM survey_responses WHERE id = ?`)
      .bind(id)
      // returns a single row or undefined
      .first<any>();

    return result ? mapResponse(result) : undefined;
  } catch (error) {
    console.error("findResponseById error:", error);
    return undefined;
  }
};
// endregion

// region countResponsesBySurveyId
export const countResponsesBySurveyId = async (
  db: D1Database,
  surveyId: string,
): Promise<number> => {
  try {
    const row = (await db
      .prepare(
        "SELECT COUNT(*) AS total FROM survey_responses WHERE survey_id = ?",
      )
      .bind(surveyId)
      .first()) as { total: number } | null;
    return row?.total ?? 0;
  } catch (error) {
    console.error("countResponsesBySurveyId error:", error);
    return 0;
  }
};
// endregion

// region findResponsesBySurveyId
export const findResponsesBySurveyId = async (
  db: D1Database,
  surveyId: string,
): Promise<SurveyResponse[]> => {
  try {
    // Returns all responses for a survey ordered by most recent first.
    const results = await db
      .prepare(
        `SELECT ${RESPONSE_COLUMNS} FROM survey_responses WHERE survey_id = ? ORDER BY submitted_at DESC`,
      )
      .bind(surveyId)
      // returns an array of all rows matching the surveyId
      .all<any>();

    return results.results.map(mapResponse);
  } catch (error) {
    console.error("findResponsesBySurveyId error:", error);
    return [];
  }
};
// endregion

// region findResponsesBySurveyIdPaginated
export const findResponsesBySurveyIdPaginated = async (
  db: D1Database,
  surveyId: string,
  options: { page?: number; pageSize?: number } = {},
): Promise<{ responses: SurveyResponse[]; total: number; page: number; pageSize: number }> => {
  try {
    const page = Math.max(1, options.page ?? 1);
    const pageSize = Math.min(200, Math.max(1, options.pageSize ?? 10));
    const offset = (page - 1) * pageSize;

    // Run count and data queries in parallel
    const [countResult, listResult] = await Promise.all([
      db
        .prepare("SELECT COUNT(*) AS total FROM survey_responses WHERE survey_id = ?")
        .bind(surveyId)
        .first<{ total: number }>(),
      db
        .prepare(
          `SELECT ${RESPONSE_COLUMNS} FROM survey_responses WHERE survey_id = ? ORDER BY submitted_at DESC LIMIT ? OFFSET ?`,
        )
        .bind(surveyId, pageSize, offset)
        .all<any>(),
    ]);

    return {
      responses: listResult.results.map(mapResponse),
      total: countResult?.total ?? 0,
      page,
      pageSize,
    };
  } catch (error) {
    console.error("findResponsesBySurveyIdPaginated error:", error);
    return { responses: [], total: 0, page: 1, pageSize: 10 };
  }
};
// endregion
