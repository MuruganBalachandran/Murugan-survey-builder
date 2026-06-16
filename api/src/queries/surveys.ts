// region imports
import type { Survey, SurveyListParams } from "../types";
// endregion

// region common survey select query
const SURVEY_SELECT = `
  SELECT
    s.id, s.user_id, s.title, s.description, s.slug,
    s.primary_color, s.logo_url, s.status, s.published_at, s.ends_at,
    s.created_at, s.updated_at,
    COUNT(DISTINCT r.id) AS response_count,
    COUNT(DISTINCT q.id) AS question_count
  FROM surveys s
  LEFT JOIN survey_responses r ON r.survey_id = s.id
  LEFT JOIN questions q ON q.survey_id = s.id`;
// endregion

// Maps a raw D1 row to the typed Survey shape
const mapSurvey = (row: any): Survey => ({
  id: row.id,
  userId: row.user_id,
  title: row.title,
  description: row.description,
  slug: row.slug,
  primaryColor: row.primary_color,
  logoUrl: row.logo_url,
  status: row.status,
  publishedAt: row.published_at,
  endsAt: row.ends_at ?? undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  responseCount: Number(row.response_count ?? 0),
  questionCount: Number(row.question_count ?? 0),
});

// region createSurvey
export const createSurvey = async (
  db: D1Database,
  survey: Omit<
    Survey,
    "createdAt" | "updatedAt" | "responseCount" | "questionCount"
  >,
): Promise<Survey | undefined> => {
  try {
    const now = new Date().toISOString();

    await db
      .prepare(
        "INSERT INTO surveys (id, user_id, title, description, slug, primary_color, logo_url, status, published_at, ends_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      )
      .bind(
        survey.id,
        survey.userId,
        survey.title,
        survey.description ?? null,
        survey.slug,
        survey.primaryColor,
        survey.logoUrl ?? null,
        survey.status ?? "draft",
        survey.publishedAt ?? null,
        survey.endsAt ?? null,
        now,
        now,
      )
      // sends the INSERT command to D1.
      .run();

    return {
      ...survey,
      createdAt: now,
      updatedAt: now,
      responseCount: 0,
      questionCount: 0,
    };
  } catch (error) {
    console.error("createSurvey error:", error);
    return undefined;
  }
};
// endregion

// region findSurveyById
export const findSurveyById = async (
  db: D1Database,
  id: string,
): Promise<Survey | undefined> => {
  try {
    const result = await db
      .prepare(`${SURVEY_SELECT} WHERE s.id = ? GROUP BY s.id`)
      .bind(id)
      // Runs the query and returns the first matching row.
      .first<any>();

    return result ? mapSurvey(result) : undefined;
  } catch (error) {
    console.error("findSurveyById error:", error);
    return undefined;
  }
};
// endregion

// region findSurveyBySlug
export const findSurveyBySlug = async (
  db: D1Database,
  slug: string,
): Promise<Survey | undefined> => {
  try {
    // select one survey
    const result = await db
      .prepare(`${SURVEY_SELECT} WHERE s.slug = ? GROUP BY s.id`)
      .bind(slug)
      // Runs the query and returns the first matching row.
      .first<any>();

    return result ? mapSurvey(result) : undefined;
  } catch (error) {
    console.error("findSurveyBySlug error:", error);
    return undefined;
  }
};
// endregion

// region findSurveysByUserId
// Returns all surveys for a user ordered by newest first.
export const findSurveysByUserId = async (
  db: D1Database,
  userId: string,
): Promise<Survey[]> => {
  try {
    // find all the surveys of an user
    const results = await db
      .prepare(
        `${SURVEY_SELECT} WHERE s.user_id = ? GROUP BY s.id ORDER BY s.created_at DESC`,
      )
      .bind(userId)
      // Execute the query and return all matching rows.
      .all<any>();

    return results.results.map(mapSurvey);
  } catch (error) {
    console.error("findSurveysByUserId error:", error);
    return [];
  }
};
// endregion

// region findSurveysByUserIdPaginated
export const findSurveysByUserIdPaginated = async (
  db: D1Database,
  userId: string,
  params: SurveyListParams,
): Promise<{ surveys: Survey[]; total: number }> => {
  try {
    // destructure params
    const {
      page,
      pageSize,
      search = "",
      status = "all",
      dateRange = "all",
      sort = "newest",
    } = params;
    // Pagination math
    const offset = (page - 1) * pageSize;

    // Build WHERE conditions incrementally
    const conditions: string[] = ["s.user_id = ?"];
    const bindings: any[] = [userId];

    // Filter by status when a specific one is requested
    if (status !== "all") {
      conditions.push("s.status = ?");
      bindings.push(status);
    }

    // Full-text search across title, description, and slug
    if (search.trim()) {
      conditions.push(
        "(s.title LIKE ? OR s.description LIKE ? OR s.slug LIKE ?)",
      );
      const term = `%${search.trim()}%`;
      bindings.push(term, term, term);
    }

    // Date range filter using SQLite datetime arithmetic
    if (dateRange === "7d") {
      conditions.push("s.created_at >= datetime('now', '-7 days')");
    } else if (dateRange === "30d") {
      conditions.push("s.created_at >= datetime('now', '-30 days')");
    }

    const where = conditions.join(" AND ");

    // Map sort option to an ORDER BY clause
    const orderClause =
      sort === "oldest"
        ? "s.created_at ASC"
        : sort === "title"
          ? "s.title ASC COLLATE NOCASE"
          : sort === "responses"
            ? "response_count DESC"
            : "s.created_at DESC";

    // Run total count and page data in parallel to halve round-trip time
    const [countResult, listResult] = await Promise.all([
      // Count query with the same WHERE conditions but no pagination or ordering
      db
        .prepare(`SELECT COUNT(*) AS total FROM surveys s WHERE ${where}`)
        .bind(...bindings)
        .first<{ total: number }>(),
      // The main query with dynamic WHERE, ORDER BY, and pagination
      db

        .prepare(
          `${SURVEY_SELECT} WHERE ${where} GROUP BY s.id ORDER BY ${orderClause} LIMIT ? OFFSET ?`,
        )
        .bind(...bindings, pageSize, offset)
        // returns all matching rows for the current page
        .all<any>(),
    ]);

    return {
      surveys: listResult.results.map(mapSurvey),
      total: Number(countResult?.total ?? 0),
    };
  } catch (error) {
    console.error("findSurveysByUserIdPaginated error:", error);
    return { surveys: [], total: 0 };
  }
};
// endregion

// region updateSurvey
export const updateSurvey = async (
  db: D1Database,
  id: string,
  updates: Partial<
    Omit<
      Survey,
      "id" | "userId" | "createdAt" | "responseCount" | "questionCount"
    >
  >,
): Promise<Survey | null> => {
  try {
    const now = new Date().toISOString();

    // Build SET clause from only the provided fields
    const fields: string[] = ["updated_at = ?"];
    const values: any[] = [now];

    // update fields and values
    if (updates.title !== undefined) {
      fields.push("title = ?");
      values.push(updates.title);
    }
    if (updates.description !== undefined) {
      fields.push("description = ?");
      values.push(updates.description);
    }
    if (updates.slug !== undefined) {
      fields.push("slug = ?");
      values.push(updates.slug);
    }
    if (updates.primaryColor !== undefined) {
      fields.push("primary_color = ?");
      values.push(updates.primaryColor);
    }
    if (updates.logoUrl !== undefined) {
      fields.push("logo_url = ?");
      values.push(updates.logoUrl);
    }
    if (updates.status !== undefined) {
      fields.push("status = ?");
      values.push(updates.status);
    }
    if (updates.publishedAt !== undefined) {
      fields.push("published_at = ?");
      values.push(updates.publishedAt);
    }
    if (updates.endsAt !== undefined) {
      fields.push("ends_at = ?");
      values.push(updates.endsAt);
    }

    // push id
    values.push(id);

    // RETURNING gives us the persisted row without a second SELECT
    const row = await db
      .prepare(
        `UPDATE surveys SET ${fields.join(", ")} WHERE id = ? RETURNING *`,
      )
      .bind(...values)
      // returns first matching row
      .first<any>();

    if (!row) return null;

    // Fetch counts separately since RETURNING does not include JOIN aggregates
    const counts = await db
      .prepare(
        `
        SELECT
          COUNT(DISTINCT r.id) AS response_count,
          COUNT(DISTINCT q.id) AS question_count
        FROM surveys s
        LEFT JOIN survey_responses r ON r.survey_id = s.id
        LEFT JOIN questions q ON q.survey_id = s.id
        WHERE s.id = ?
        GROUP BY s.id
      `,
      )
      .bind(id)
      // returns first matching row with counts
      .first<{ response_count: number; question_count: number }>();

    return mapSurvey({
      ...row,
      response_count: counts?.response_count ?? 0,
      question_count: counts?.question_count ?? 0,
    });
  } catch (error) {
    console.error("updateSurvey error:", error);
    return null;
  }
};
// endregion

// region deleteSurvey
export const deleteSurvey = async (
  db: D1Database,
  id: string,
): Promise<boolean> => {
  try {
    // delete the survey and all its dependencies in a single transaction
    await db.batch([
      // questions
      db.prepare("DELETE FROM questions WHERE survey_id = ?").bind(id),
      // survey responses
      db.prepare("DELETE FROM survey_responses WHERE survey_id = ?").bind(id),
      // the survey itself
      db.prepare("DELETE FROM surveys WHERE id = ?").bind(id),
    ]);
    return true;
  } catch (error) {
    console.error("deleteSurvey error:", error);
    return false;
  }
};
// endregion
