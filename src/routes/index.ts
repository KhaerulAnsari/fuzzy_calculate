import { Router } from "express";
import authRouter from "./auth.js";
import fuzzyRoutes from "./fuzzy.js";
import categoryRoutes from "./category.js";
import subcategoryRoutes from "./subcategory.js";

const rootRouter: Router = Router();

rootRouter.use("/auth", authRouter);
rootRouter.use("/fuzzy", fuzzyRoutes);
rootRouter.use("/master", categoryRoutes);
rootRouter.use("/master", subcategoryRoutes);
export default rootRouter;

/* 1. user management
    a. list users
    b. get user byId
    c. change user role
    2. order management
        a. list all orders (filter on status)
        b. change order status
    3. products
        a. search api for products (for both users and admin) -> full text search
*/
