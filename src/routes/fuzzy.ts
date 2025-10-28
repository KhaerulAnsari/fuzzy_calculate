import { Router } from 'express';
import {
  saveAssessment,
  getAssessmentById,
  getAllAssessments,
  deleteAssessment,
  searchAssessments,
  getAssessmentsByDate,
} from '../controllers/fuzzy.js';
import authMiddleware from '../middlewares/auth.js';
import { errorHandler } from '../error_handler.js';

const fuzzyRoutes: Router = Router();




/**
 * POST /api/fuzzy/assessments
 * Save building assessment
 */
fuzzyRoutes.post('/assessments', [authMiddleware] as any, errorHandler(saveAssessment) as any);

/**
 * GET /api/fuzzy/assessments
 * Get all assessments for current user
 */
fuzzyRoutes.get('/assessments', [authMiddleware] as any, errorHandler(getAllAssessments) as any);
fuzzyRoutes.get('/assessments/search', [authMiddleware] as any, errorHandler(searchAssessments) as any);

/**
 * GET /api/fuzzy/assessments/filter/date
 * Get assessments filtered by date (day/month/year)
 * Query params: day (YYYY-MM-DD), month (YYYY-MM), or year (YYYY)
 */
fuzzyRoutes.get('/assessments/filter/date', [authMiddleware] as any, errorHandler(getAssessmentsByDate) as any);

/**
 * GET /api/fuzzy/assessments/:buildingId
 * Get assessment by ID
 */
fuzzyRoutes.get('/assessments/:buildingId', [authMiddleware] as any, errorHandler(getAssessmentById) as any);

/**
 * DELETE /api/fuzzy/assessments/:buildingId
 * Delete assessment
 */
fuzzyRoutes.delete('/assessments/:buildingId', [authMiddleware] as any, errorHandler(deleteAssessment) as any);

export default fuzzyRoutes;
