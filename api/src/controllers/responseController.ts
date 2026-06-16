// region imports
import type { Context } from "hono";

import {
  createResponse,
  findResponsesBySurveyId,
  findSurveyById,
  updateSurvey,
} from "../queries";
import type { ApiResponse, SurveyResponse } from "../types";
import { generateId, HTTP_STATUS } from "../utils";
// endregion

// region submit response

export const submitSurveyResponse = async (c: Context): Promise<Response> => {
  try {
    const db = c.env.DB;
    const surveyId = c.req.param("surveyId") || "";

    if (!surveyId) {
      return c.json<ApiResponse<null>>(
        { success: false, message: "Invalid survey ID" },
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const survey = await findSurveyById(db, surveyId);
    if (!survey) {
      return c.json<ApiResponse<null>>(
        { success: false, message: "Survey not found" },
        HTTP_STATUS.NOT_FOUND,
      );
    }

    if (survey.status !== "published") {
      return c.json<ApiResponse<null>>(
        { success: false, message: "Survey is not accepting responses" },
        HTTP_STATUS.FORBIDDEN,
      );
    }

    if (survey.endsAt && new Date(survey.endsAt) < new Date()) {
      await updateSurvey(db, surveyId, { status: "closed" });
      return c.json<ApiResponse<null>>(
        { success: false, message: "Survey has ended" },
        HTTP_STATUS.FORBIDDEN,
      );
    }

    const body = (await c.req.json()) as {
      answers: { questionId: string; value: string | string[] | number }[];
    };

    if (!Array.isArray(body.answers)) {
      return c.json<ApiResponse<null>>(
        {
          success: false,
          message: "Invalid request",
          errors: { answers: "answers must be an array" },
        },
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const response = await createResponse(db, {
      id: generateId(),
      surveyId,
      answers: body.answers,
    });

    if (!response) {
      return c.json<ApiResponse<null>>(
        { success: false, message: "Failed to submit response" },
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    return c.json<ApiResponse<SurveyResponse>>(
      { success: true, message: "Response submitted", data: response },
      HTTP_STATUS.CREATED,
    );
  } catch (error) {
    console.error("Submit response error:", error);
    return c.json<ApiResponse<null>>(
      { success: false, message: "Internal server error" },
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }
};

// endregion

// region get responses

export const getSurveyResponses = async (c: Context): Promise<Response> => {
  try {
    const db = c.env.DB;
    const user = c.get("user");
    const surveyId = c.req.param("surveyId") || "";

    if (!surveyId) {
      return c.json<ApiResponse<null>>(
        { success: false, message: "Invalid survey ID" },
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const survey = await findSurveyById(db, surveyId);
    if (!survey) {
      return c.json<ApiResponse<null>>(
        { success: false, message: "Survey not found" },
        HTTP_STATUS.NOT_FOUND,
      );
    }

    if (survey.userId !== user.userId) {
      return c.json<ApiResponse<null>>(
        { success: false, message: "Forbidden" },
        HTTP_STATUS.FORBIDDEN,
      );
    }

    const responses = await findResponsesBySurveyId(db, surveyId);
    return c.json<ApiResponse<SurveyResponse[]>>(
      { success: true, message: "Responses retrieved", data: responses },
      HTTP_STATUS.OK,
    );
  } catch (error) {
    console.error("Get responses error:", error);
    return c.json<ApiResponse<null>>(
      { success: false, message: "Internal server error" },
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }
};

// endregion
