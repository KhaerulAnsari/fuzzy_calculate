import type { Request, Response } from "express";
import { NotFoundException } from "../exceptions/not-found.js";
import { ErrorCode } from "../exceptions/root.js";
import { ChangeQuantitySchema, CreateCartSchema } from "../schema/cart.js";
import type { Product } from "../generated/prisma/index.js";
import { prismaClient } from "../index.js";
import sendSuccess from "../utils/response.js";

export const addItemToCartController = async (req: Request, res: Response) => {
  const validateData = CreateCartSchema.parse(req.body);
  let product: Product;
  try {
    product = await prismaClient.product.findFirstOrThrow({
      where: {
        id: validateData.productId,
      },
    });
  } catch (err) {
    throw new NotFoundException(
      "Product not found",
      ErrorCode.PRODUCT_NOT_FOUND
    );
  }

  // check cart berdasarkan productId jika ada update quantitinya jika tidak maka create cart
  const existCart = await prismaClient.cartItem.findFirst({
    where: {
      userId: req.user.id,
      productId: product.id,
    },
  });

  // check klo userId == userId yang ada di product maka gagal menambahkan ke cart

  if (existCart) {
    changeQuantityController(req, res, existCart.id);
  } else {
    const cart = await prismaClient.cartItem.create({
      data: {
        userId: req.user.id,
        productId: product.id,
        quantity: validateData.quantity,
      },
    });

    sendSuccess(res, 201, "Add to cart successfully", cart as any);
  }
};

export const deleteItemFromCartController = async (
  req: Request,
  res: Response
) => {
  try {
    await prismaClient.cartItem.delete({
      where: {
        id: Number(req.params.id),
        userId: req.user.id,
      },
    });

    sendSuccess(res, 200, "Delete cart successfully");
  } catch (err) {
    throw new NotFoundException("Cart not found", ErrorCode.CART_NOT_FOUND);
  }
};

export const changeQuantityController = async (
  req: Request,
  res: Response,
  id?: number
) => {
  const validateData = ChangeQuantitySchema.parse(req.body);
  const cartId = req.params.id ?? id;

  const updateCart = await prismaClient.cartItem.update({
    where: {
      id: Number(cartId),
      userId: req.user.id,
    },

    data: {
      quantity: validateData.quantity,
    },
  });

  sendSuccess(res, 200, "Change quantity successfully", updateCart as any);
};

export const getCartContoller = async (req: Request, res: Response) => {
  const cart = await prismaClient.cartItem.findMany({
    where: {
      userId: req.user.id,
    },
    include: {
      product: true,
    },
  });

  sendSuccess(res, 200, "Fatch all cart successfully", cart as any);
};
