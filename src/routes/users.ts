import { Router } from "express";
import { errorHandler } from "../error_handler.js";
import {
  changeUserRoleController,
  createAddressController,
  deleteAddressController,
  getUserbyIdController,
  listAddressController,
  listUsersController,
  updateAddressController,
  updateUserController,
} from "../controllers/users.js";
import authMiddleware from "../middlewares/auth.js";
import adminMiddleware from "../middlewares/admin.js";

const usersRouter: Router = Router();

usersRouter.post(
  "/address",
  [authMiddleware as any],
  errorHandler(createAddressController) as any
);
usersRouter.put(
  "/address/:id",
  [authMiddleware as any],
  errorHandler(updateAddressController) as any
);

usersRouter.delete(
  "/address/:id",
  [authMiddleware as any],
  errorHandler(deleteAddressController) as any
);

usersRouter.get(
  "/address",
  [authMiddleware as any],
  errorHandler(listAddressController) as any
);

usersRouter.put(
  "/",
  [authMiddleware as any],
  errorHandler(updateUserController) as any
);

usersRouter.put(
  "/:id/role",
  [authMiddleware, adminMiddleware as any],
  errorHandler(changeUserRoleController) as any
);

usersRouter.get(
  "/",
  [authMiddleware, adminMiddleware as any],
  errorHandler(listUsersController) as any
);

usersRouter.get(
  "/:id",
  [authMiddleware, adminMiddleware as any],
  errorHandler(getUserbyIdController) as any
);
export default usersRouter;
