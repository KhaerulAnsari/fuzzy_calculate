import { Router } from 'express';
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/category.js';
import authMiddleware from '../middlewares/auth.js';
import adminMiddleware from '../middlewares/admin.js';
import { errorHandler } from '../error_handler.js';

const categoryRoutes: Router = Router();

// Public routes - anyone can read categories
categoryRoutes.get('/categories', errorHandler(getAllCategories));
categoryRoutes.get('/categories/:categoryId', errorHandler(getCategoryById));

// Protected routes - only admin can modify
categoryRoutes.post(
  '/categories',
  [authMiddleware, adminMiddleware],
  errorHandler(createCategory)
);
categoryRoutes.put(
  '/categories/:categoryId',
  [authMiddleware, adminMiddleware],
  errorHandler(updateCategory)
);
categoryRoutes.delete(
  '/categories/:categoryId',
  [authMiddleware, adminMiddleware],
  errorHandler(deleteCategory)
);

export default categoryRoutes;
