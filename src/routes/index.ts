import { Router } from "express";
import authRouter from "./auth.js";
import productsRouter from "./product.js";
import usersRouter from "./users.js";
import cartRouters from "./cart.js";
import orderRouters from "./orders.js";

const rootRouter: Router = Router();

rootRouter.use("/auth", authRouter);
rootRouter.use("/products", productsRouter);
rootRouter.use("/users", usersRouter);
rootRouter.use("/carts", cartRouters);
rootRouter.use("/orders", orderRouters);

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
