// region imports
import { Hono } from "hono";
import {
  addQuestion,
  deleteQuestionById,
  reorderSurveyQuestions,
  updateQuestionDetails,
} from "../controllers/questionsController";
import { authMiddleware } from "../middleware";
// endregion


// routes initialization
const questionRoutes = new Hono();

// region routes
// reorder questions
questionRoutes.put(
  "/:surveyId/questions/reorder",
  authMiddleware,
  reorderSurveyQuestions,
);

// add question to survey
questionRoutes.post("/:surveyId/questions", authMiddleware, addQuestion);

// update question
questionRoutes.put(
  "/:surveyId/questions/:questionId",
  authMiddleware,
  updateQuestionDetails,
);

// delete question
questionRoutes.delete(
  "/:surveyId/questions/:questionId",
  authMiddleware,
  deleteQuestionById,
);
// endregion

// region export
export default questionRoutes;
// endregion
