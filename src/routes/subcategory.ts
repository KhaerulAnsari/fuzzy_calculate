import { Router } from 'express';
import {
  getAllSubcategories,
  getSubcategoryById,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
} from '../controllers/subcategory.js';
import authMiddleware from '../middlewares/auth.js';
import adminMiddleware from '../middlewares/admin.js';
import { errorHandler } from '../error_handler.js';

const subcategoryRoutes: Router = Router();

// Public routes - anyone can read subcategories
subcategoryRoutes.get('/subcategories', errorHandler(getAllSubcategories));
subcategoryRoutes.get('/subcategories/:subcategoryId', errorHandler(getSubcategoryById));

// Protected routes - only admin can modify
subcategoryRoutes.post(
  '/subcategories',
  [authMiddleware, adminMiddleware],
  errorHandler(createSubcategory)
);
subcategoryRoutes.put(
  '/subcategories/:subcategoryId',
  [authMiddleware, adminMiddleware],
  errorHandler(updateSubcategory)
);
subcategoryRoutes.delete(
  '/subcategories/:subcategoryId',
  [authMiddleware, adminMiddleware],
  errorHandler(deleteSubcategory)
);

export default subcategoryRoutes;
