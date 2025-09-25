import { Router } from "express";
import {
  loginController,
  meController,
  signUpController,
} from "../controllers/auth.js";
import { errorHandler } from "../error_handler.js";
import authMiddleware from "../middlewares/auth.js";

const authRouter: Router = Router();

authRouter.post("/login", errorHandler(loginController) as any);
authRouter.post("/signup", errorHandler(signUpController) as any);
authRouter.get(
  "/me",
  [authMiddleware as any],
  errorHandler(meController) as any
);

export default authRouter;
