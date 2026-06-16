// region imports
import type { Context } from "hono";
import {
  createQuestion,
  deleteQuestion,
  findQuestionById,
  findQuestionsBysurveyId,
  findSurveyById,
  reorderQuestions,
  updateQuestion,
} from "../queries";
import type {
  ApiResponse,
  Question,
  QuestionType,
  QuestionUiType,
} from "../types";
import { generateId, HTTP_STATUS, validateQuestion } from "../utils";
// endregion

// region add question
export const addQuestion = async (c: Context): Promise<Response> => {
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

    const body = (await c.req.json()) as {
      type: QuestionType;
      uiType?: QuestionUiType;
      title: string;
      description?: string;
      options?: string[];
      required?: boolean;
    };

    const validationErrors = validateQuestion(body);
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

    const existingQuestions = await findQuestionsBysurveyId(db, surveyId);
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
    });

    if (!question) {
      return c.json<ApiResponse<null>>(
        { success: false, message: "Failed to create question" },
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    return c.json<ApiResponse<Question>>(
      { success: true, message: "Question added", data: question },
      HTTP_STATUS.CREATED,
    );
  } catch (error) {
    console.error("Add question error:", error);
    return c.json<ApiResponse<null>>(
      { success: false, message: "Internal server error" },
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }
};
// endregion

// region update question
export const updateQuestionDetails = async (c: Context): Promise<Response> => {
  try {
    const db = c.env.DB;
    const user = c.get("user");
    const surveyId = c.req.param("surveyId") || "";
    const questionId = c.req.param("questionId") || "";

    if (!surveyId || !questionId) {
      return c.json<ApiResponse<null>>(
        { success: false, message: "Invalid survey or question ID" },
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const survey = await findSurveyById(db, surveyId);
    if (!survey || survey.userId !== user.userId) {
      return c.json<ApiResponse<null>>(
        { success: false, message: "Forbidden" },
        HTTP_STATUS.FORBIDDEN,
      );
    }

    const body = (await c.req.json()) as {
      type?: QuestionType;
      uiType?: QuestionUiType;
      title?: string;
      description?: string;
      options?: string[];
      required?: boolean;
    };

    const existingQuestion = await findQuestionById(db, questionId);
    if (!existingQuestion) {
      return c.json<ApiResponse<null>>(
        { success: false, message: "Question not found" },
        HTTP_STATUS.NOT_FOUND,
      );
    }

    const validationErrors = validateQuestion({
      type: body.type ?? existingQuestion.type,
      title: body.title ?? existingQuestion.title,
      description: body.description ?? existingQuestion.description,
      options: body.options ?? existingQuestion.options,
    });

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

    const updatedQuestion = await updateQuestion(db, questionId, body);
    if (!updatedQuestion) {
      return c.json<ApiResponse<null>>(
        { success: false, message: "Question not found" },
        HTTP_STATUS.NOT_FOUND,
      );
    }

    return c.json<ApiResponse<Question>>(
      { success: true, message: "Question updated", data: updatedQuestion },
      HTTP_STATUS.OK,
    );
  } catch (error) {
    console.error("Update question error:", error);
    return c.json<ApiResponse<null>>(
      { success: false, message: "Internal server error" },
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }
};
// endregion

// region delete question
export const deleteQuestionById = async (c: Context): Promise<Response> => {
  try {
    const db = c.env.DB;
    const user = c.get("user");
    const surveyId = c.req.param("surveyId") || "";
    const questionId = c.req.param("questionId") || "";

    if (!surveyId || !questionId) {
      return c.json<ApiResponse<null>>(
        { success: false, message: "Invalid survey or question ID" },
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const survey = await findSurveyById(db, surveyId);
    if (!survey || survey.userId !== user.userId) {
      return c.json<ApiResponse<null>>(
        { success: false, message: "Forbidden" },
        HTTP_STATUS.FORBIDDEN,
      );
    }

    const deleted = await deleteQuestion(db, questionId);
    if (!deleted) {
      return c.json<ApiResponse<null>>(
        { success: false, message: "Question not found" },
        HTTP_STATUS.NOT_FOUND,
      );
    }

    return c.json<ApiResponse<null>>(
      { success: true, message: "Question deleted" },
      HTTP_STATUS.OK,
    );
  } catch (error) {
    console.error("Delete question error:", error);
    return c.json<ApiResponse<null>>(
      { success: false, message: "Internal server error" },
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }
};
// endregion

// region reorder questions
export const reorderSurveyQuestions = async (c: Context): Promise<Response> => {
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
    if (!survey || survey.userId !== user.userId) {
      return c.json<ApiResponse<null>>(
        { success: false, message: "Forbidden" },
        HTTP_STATUS.FORBIDDEN,
      );
    }

    const body = (await c.req.json()) as { questionIds: string[] };

    if (!Array.isArray(body.questionIds)) {
      return c.json<ApiResponse<null>>(
        {
          success: false,
          message: "Invalid request",
          errors: { questionIds: "questionIds must be an array" },
        },
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const reordered = await reorderQuestions(db, surveyId, body.questionIds);
    if (!reordered) {
      return c.json<ApiResponse<null>>(
        { success: false, message: "Failed to reorder questions" },
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    const questions = await findQuestionsBysurveyId(db, surveyId);
    return c.json<ApiResponse<Question[]>>(
      { success: true, message: "Questions reordered", data: questions },
      HTTP_STATUS.OK,
    );
  } catch (error) {
    console.error("Reorder questions error:", error);
    return c.json<ApiResponse<null>>(
      { success: false, message: "Internal server error" },
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }
};
// endregion
