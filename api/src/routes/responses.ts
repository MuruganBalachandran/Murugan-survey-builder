// imports
import { Hono } from 'hono'
import { getSurveyResponses, submitSurveyResponse } from '../controllers/responseController'
import { authMiddleware } from '../middleware'

// routes initialization
const responseRoutes = new Hono()

// response routes
// submit survey response (public - no auth required)
responseRoutes.post('/:surveyId/responses', submitSurveyResponse)

// get survey responses (requires auth)
responseRoutes.get('/:surveyId/responses', authMiddleware, getSurveyResponses)

// export
export default responseRoutes
