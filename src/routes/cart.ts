import { Router } from "express";
import { addItemToCartController, changeQuantityController, deleteItemFromCartController, getCartContoller } from "../controllers/cart.js";
import { errorHandler } from "../error_handler.js";
import authMiddleware from "../middlewares/auth.js";

const cartRouters : Router = Router()

cartRouters.post('/',[authMiddleware as any], errorHandler(addItemToCartController) as any)
cartRouters.put('/:id',[authMiddleware as any], errorHandler(changeQuantityController) as any)
cartRouters.delete('/:id',[authMiddleware as any], errorHandler(deleteItemFromCartController) as any)
cartRouters.get('/',[authMiddleware as any], errorHandler(getCartContoller) as any)

export default cartRouters