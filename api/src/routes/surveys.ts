// imports
import { Hono } from 'hono'
import {
  createNewSurvey,
  deleteSurveyById,
  getSurveyById,
  getUserSurveys,
  getPublicSurvey,
  updateSurveyDetails,
} from '../controllers/surveyController'
import { authMiddleware } from '../middleware'

// routes initialization
const surveyRoutes = new Hono()

// public routes - no authentication required
// get public survey by slug
surveyRoutes.get('/public/:slug', getPublicSurvey)

// root survey routes - authentication required
// create new survey
surveyRoutes.post('/', authMiddleware, createNewSurvey)

// get user surveys
surveyRoutes.get('/', authMiddleware, getUserSurveys)

// survey id routes - generic patterns last
// get survey by id with questions
surveyRoutes.get('/:id', authMiddleware, getSurveyById)

// update survey details
surveyRoutes.put('/:id', authMiddleware, updateSurveyDetails)

// delete survey
surveyRoutes.delete('/:id', authMiddleware, deleteSurveyById)

// export
export default surveyRoutes
