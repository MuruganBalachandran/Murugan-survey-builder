// region imports
import { Hono } from 'hono'
import {
  createNewSurvey,
  deleteSurveyById,
  getPublicSurvey,
  getSurveyById,
  getUserSurveys,
  updateSurveyDetails,
} from '../controllers/surveyController'
import { authMiddleware } from '../middleware'
// endregion

// routes initialization
const surveyRoutes = new Hono()

// region routes
// get public survey by slug
surveyRoutes.get('/public/:slug', getPublicSurvey)

// create new survey
surveyRoutes.post('/', authMiddleware, createNewSurvey)

// get user surveys
surveyRoutes.get('/', authMiddleware, getUserSurveys)

// get survey by id with questions
surveyRoutes.get('/:id', authMiddleware, getSurveyById)

// update survey details
surveyRoutes.put('/:id', authMiddleware, updateSurveyDetails)

// delete survey
surveyRoutes.delete('/:id', authMiddleware, deleteSurveyById)
// endregion

// region export
export default surveyRoutes
// endregion