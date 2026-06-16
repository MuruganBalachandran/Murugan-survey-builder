// region imports
import { Hono } from "hono";
import {
  getSurveyResponses,
  submitSurveyResponse,
} from "../controllers/responseController";
import { authMiddleware } from "../middleware";
import { submitRateLimiter } from "../middleware/rateLimit";
// endregion

// routes initialization
const responseRoutes = new Hono();

// region routes
// submit survey response — public, but rate-limited to 1 per IP per survey per 24 h
responseRoutes.post("/:surveyId/responses", submitRateLimiter, submitSurveyResponse);

// get survey responses (requires auth)
responseRoutes.get("/:surveyId/responses", authMiddleware, getSurveyResponses);
// endregion

// region export
export default responseRoutes;
// endregion
