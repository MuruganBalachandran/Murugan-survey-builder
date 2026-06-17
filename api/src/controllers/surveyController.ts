// region imports
import type { Context } from "hono";
import {
  createSurvey,
  deleteSurvey,
  findQuestionsBysurveyId,
  findSurveyById,
  findSurveyBySlug,
  findSurveysByUserIdPaginated,
  updateSurvey,
} from "../queries";
import type {
  ApiResponse,
  Survey,
  SurveyStatus,
  SurveyWithQuestions,
} from "../types";
import {
  DEFAULT_PRIMARY_COLOR,
  generateId,
  generateSlug,
  HTTP_STATUS,
  validateSurveyTitle,
  validateSurveyUpdate,
} from "../utils";
// endregion

// region create survey
export const createNewSurvey = async (c: Context): Promise<Response> => {
  try {
    // db and user details
    const db = c.env.DB;
    const user = c.get("user");
    const body = (await c.req.json()) as {
      title: string;
      description?: string;
      endsAt?: string;
    };
    // destructure title and description from body
    const { title, description, endsAt } = body;

    // validate title
    const titleError = validateSurveyTitle(title);
    if (titleError) {
      return c.json<ApiResponse<null>>(
        {
          success: false,
          message: "Validation failed",
          errors: { [titleError.field]: titleError.message },
        },
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // generate slug and create survey
    const slug = generateSlug(title);
    const survey = await createSurvey(db, {
      id: generateId(),
      userId: user.userId,
      title: title.trim(),
      description: description?.trim(),
      slug,
      primaryColor: DEFAULT_PRIMARY_COLOR,
      logoUrl: undefined,
      status: "draft",
      endsAt: endsAt ?? undefined,
    });

    // if survey not found return error
    if (!survey) {
      console.error("Survey creation returned undefined for user:", user.userId);
      return c.json<ApiResponse<null>>(
        { success: false, message: "Failed to create survey" },
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    // return created survey
    return c.json<ApiResponse<Survey>>(
      { success: true, message: "Survey created", data: survey },
      HTTP_STATUS.CREATED,
    );
  } catch (error) {
    console.error("Create survey error:", error);
    return c.json<ApiResponse<null>>(
      { success: false, message: "Internal server error" },
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }
};
// endregion

// region get user surveys
export const getUserSurveys = async (c: Context): Promise<Response> => {
  try {
    // db and user details
    const db = c.env.DB;
    const user = c.get("user");

    // pagination and filtering details
    const page = Math.max(1, Number(c.req.query("page") ?? 1));
    const pageSize = Math.min(
      200,
      Math.max(1, Number(c.req.query("pageSize") ?? 6)),
    );
    const search = c.req.query("search") ?? "";
    const status = c.req.query("status") ?? "all";
    const dateRange = c.req.query("dateRange") ?? "all";
    const sort = c.req.query("sort") ?? "newest";

    // fetch surveys based on user id and pagination/filtering details
    const { surveys, total } = await findSurveysByUserIdPaginated(
      db,
      user.userId,
      { page, pageSize, search, status, dateRange, sort },
    );

    return c.json<
      ApiResponse<{
        surveys: Survey[];
        total: number;
        page: number;
        pageSize: number;
      }>
    >(
      {
        success: true,
        message: "Surveys retrieved",
        data: { surveys, total, page, pageSize },
      },
      HTTP_STATUS.OK,
    );
  } catch (error) {
    console.error("Get surveys error:", error);
    return c.json<ApiResponse<null>>(
      { success: false, message: "Internal server error" },
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }
};
// endregion

// region get survey by id
export const getSurveyById = async (c: Context): Promise<Response> => {
  try {
    // db and user details
    const db = c.env.DB;
    const user = c.get("user");
    const id = c.req.param("id") || "";

    // validate id
    if (!id) {
      return c.json<ApiResponse<null>>(
        { success: false, message: "Invalid survey ID" },
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // fetch survey by id
    const survey = await findSurveyById(db, id);
    if (!survey) {
      return c.json<ApiResponse<null>>(
        { success: false, message: "Survey not found" },
        HTTP_STATUS.NOT_FOUND,
      );
    }

    // check if survey belongs to user
    if (survey.userId !== user.userId) {
      return c.json<ApiResponse<null>>(
        { success: false, message: "Forbidden" },
        HTTP_STATUS.FORBIDDEN,
      );
    }

    // fetch questions for the survey and return survey with questions
    const questions = await findQuestionsBysurveyId(db, id);
    const surveyWithQuestions: SurveyWithQuestions = { ...survey, questions };

    return c.json<ApiResponse<SurveyWithQuestions>>(
      { success: true, message: "Survey retrieved", data: surveyWithQuestions },
      HTTP_STATUS.OK,
    );
  } catch (error) {
    console.error("Get survey error:", error);
    return c.json<ApiResponse<null>>(
      { success: false, message: "Internal server error" },
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }
};
// endregion

// region get public survey
export const getPublicSurvey = async (c: Context): Promise<Response> => {
  try {
    // db details and slug from request params
    const db = c.env.DB;
    const slug = c.req.param("slug") || "";

    // validate slug
    if (!slug) {
      return c.json<ApiResponse<null>>(
        { success: false, message: "Invalid survey slug" },
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // fetch survey by slug
    const survey = await findSurveyBySlug(db, slug);
    if (!survey) {
      return c.json<ApiResponse<null>>(
        { success: false, message: "Survey not found" },
        HTTP_STATUS.NOT_FOUND,
      );
    }

    // check if survey is published or closed — return data either way so the public page can render
    if (survey.status === "draft") {
      return c.json<ApiResponse<null>>(
        { success: false, message: "Survey not found" },
        HTTP_STATUS.NOT_FOUND,
      );
    }

    // perform find questions by survey id and return survey with questions
    const questions = await findQuestionsBysurveyId(db, survey.id);
    const surveyWithQuestions: SurveyWithQuestions = { ...survey, questions };

    return c.json<ApiResponse<SurveyWithQuestions>>(
      { success: true, message: "Survey retrieved", data: surveyWithQuestions },
      HTTP_STATUS.OK,
    );
  } catch (error) {
    console.error("Get public survey error:", error);
    return c.json<ApiResponse<null>>(
      { success: false, message: "Internal server error" },
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }
};
// endregion

// region update survey
export const updateSurveyDetails = async (c: Context): Promise<Response> => {
  try {
    // db and user details
    const db = c.env.DB;
    const user = c.get("user");
    const id = c.req.param("id") || "";

    // validate id
    if (!id) {
      return c.json<ApiResponse<null>>(
        { success: false, message: "Invalid survey ID" },
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // fetch survey by id
    const survey = await findSurveyById(db, id);
    if (!survey) {
      return c.json<ApiResponse<null>>(
        { success: false, message: "Survey not found" },
        HTTP_STATUS.NOT_FOUND,
      );
    }

    // check if survey belongs to user
    if (survey.userId !== user.userId) {
      return c.json<ApiResponse<null>>(
        { success: false, message: "Forbidden" },
        HTTP_STATUS.FORBIDDEN,
      );
    }

    // destructure fields from body
    const body = (await c.req.json()) as {
      title?: string;
      description?: string;
      primaryColor?: string;
      logoUrl?: string;
      status?: SurveyStatus;
      publishedAt?: string;
      endsAt?: string;
      maxResponses?: number | null;
      thankYouMessage?: string;
    };

    // validate fields and return errors if any
    const validationErrors = validateSurveyUpdate(body);
    if (Object.keys(validationErrors).length > 0) {
      return c.json<ApiResponse<null>>(
        {
          success: false,
          message: "Validation failed",
          errors: validationErrors,
        },
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // update survey
    const updatedSurvey = await updateSurvey(db, id, {
      title: body.title || survey.title,
      description:
        body.description !== undefined ? body.description : survey.description,
      primaryColor: body.primaryColor || survey.primaryColor,
      logoUrl: body.logoUrl !== undefined ? body.logoUrl : survey.logoUrl,
      status: body.status || survey.status,
      publishedAt:
        body.publishedAt !== undefined ? body.publishedAt : survey.publishedAt,
      endsAt: body.endsAt !== undefined ? body.endsAt : survey.endsAt,
      maxResponses:
        body.maxResponses !== undefined
          ? (body.maxResponses ?? undefined)
          : survey.maxResponses,
      thankYouMessage:
        body.thankYouMessage !== undefined
          ? body.thankYouMessage
          : survey.thankYouMessage,
      slug: survey.slug,
    });

    // if update failed return error
    if (!updatedSurvey) {
      return c.json<ApiResponse<null>>(
        { success: false, message: "Failed to update survey" },
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    return c.json<ApiResponse<Survey>>(
      { success: true, message: "Survey updated", data: updatedSurvey },
      HTTP_STATUS.OK,
    );
  } catch (error) {
    console.error("Update survey error:", error);
    return c.json<ApiResponse<null>>(
      { success: false, message: "Internal server error" },
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }
};
// endregion

// region delete survey
export const deleteSurveyById = async (c: Context): Promise<Response> => {
  try {
    // db and user details
    const db = c.env.DB;
    const user = c.get("user");
    const id = c.req.param("id") || "";

    // validate id
    if (!id) {
      return c.json<ApiResponse<null>>(
        { success: false, message: "Invalid survey ID" },
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // fetch survey
    const survey = await findSurveyById(db, id);
    if (!survey) {
      return c.json<ApiResponse<null>>(
        { success: false, message: "Survey not found" },
        HTTP_STATUS.NOT_FOUND,
      );
    }

    // check if survey belongs to user
    if (survey.userId !== user.userId) {
      return c.json<ApiResponse<null>>(
        { success: false, message: "Forbidden" },
        HTTP_STATUS.FORBIDDEN,
      );
    }

    // perform delete
    const deleted = await deleteSurvey(db, id);
    if (!deleted) {
      return c.json<ApiResponse<null>>(
        { success: false, message: "Failed to delete survey" },
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    return c.json<ApiResponse<null>>(
      { success: true, message: "Survey deleted" },
      HTTP_STATUS.OK,
    );
  } catch (error) {
    console.error("Delete survey error:", error);
    return c.json<ApiResponse<null>>(
      { success: false, message: "Internal server error" },
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }
};
// endregion
