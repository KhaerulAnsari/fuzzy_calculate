import { Router } from "express";
import authMiddleware from "../middlewares/auth.js";
import { errorHandler } from "../error_handler.js";
import {
  cancelOrderController,
  changeStatusController,
  createOrderController,
  getOrderByIdController,
  listAllOrdersController,
  listOrdersController,
  listUserOrdersController,
} from "../controllers/orders.js";
import adminMiddleware from "../middlewares/admin.js";

const orderRouters: Router = Router();

orderRouters.post(
  "/",
  [authMiddleware as any],
  errorHandler(createOrderController) as any
);
orderRouters.get("/", [authMiddleware as any], errorHandler(listOrdersController) as any);
orderRouters.put(
  "/:id/cancel",
  [authMiddleware as any],
  errorHandler(cancelOrderController) as any
);

orderRouters.get("/index", [authMiddleware, adminMiddleware as any], errorHandler(listAllOrdersController) as any)
orderRouters.get("/users/:id", [authMiddleware, adminMiddleware as any], errorHandler(listUserOrdersController) as any)
orderRouters.put("/:id/status", [authMiddleware, adminMiddleware as any], errorHandler(changeStatusController) as any)
orderRouters.get(
  "/:id",
  [authMiddleware as any],
  errorHandler(getOrderByIdController) as any
);

export default orderRouters
