// region imports
import { Hono } from "hono";
import {
  getSurveyResponses,
  submitSurveyResponse,
} from "../controllers/responseController";
import { authMiddleware } from "../middleware";
// endregion

// routes initialization
const responseRoutes = new Hono();

// region routes
// submit survey response (public - no auth required)
responseRoutes.post("/:surveyId/responses", submitSurveyResponse);

// get survey responses (requires auth)
responseRoutes.get("/:surveyId/responses", authMiddleware, getSurveyResponses);
// endregion

// region export
export default responseRoutes;
// endregion
