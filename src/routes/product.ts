import { Router } from "express";
import { errorHandler } from "../error_handler.js";
import {
  createProductController,
  deleteProductController,
  getProductByIdController,
  listProductcController,
  searchProductsController,
  updateProductController,
} from "../controllers/product.js";
import authMiddleware from "../middlewares/auth.js";
import adminMiddleware from "../middlewares/admin.js";
import { error } from "console";

const productsRouter: Router = Router();

productsRouter.post(
  "/",
  [authMiddleware, adminMiddleware as any],
  errorHandler(createProductController) as any
);

productsRouter.put(
  "/:id",
  [authMiddleware, adminMiddleware as any],
  errorHandler(updateProductController) as any
);

productsRouter.delete(
  "/:id",
  [authMiddleware, adminMiddleware as any],
  errorHandler(deleteProductController) as any
);

productsRouter.get(
  "/",
  [authMiddleware, adminMiddleware as any],
  errorHandler(listProductcController) as any
);

productsRouter.get(
  "/search",
  [authMiddleware as any],
  errorHandler(searchProductsController) as any
);

productsRouter.get(
  "/:id",
  [authMiddleware, adminMiddleware as any],
  errorHandler(getProductByIdController) as any
);



export default productsRouter;
