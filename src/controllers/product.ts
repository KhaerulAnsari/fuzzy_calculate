import type { Request, Response } from "express";
import { prismaClient } from "../index.js";
import { NotFoundException } from "../exceptions/not-found.js";
import { ErrorCode } from "../exceptions/root.js";
import sendSuccess from "../utils/response.js";

export const createProductController = async (req: Request, res: Response) => {
  // ["tea", "india"] => "tea,india"

  // Create a validator to for this request
  const product = await prismaClient.product.create({
    data: {
      ...req.body,
      tags: req.body.tags.join(","),
    },
  });

  res.json(product);
};

export const updateProductController = async (req: Request, res: Response) => {
  try {
    const product = req.body;
    if (product.tags) {
      product.tags = product.tags.join(",");
    }

    if (!req.params.id) {
      throw new NotFoundException(
        "Product ID is required",
        ErrorCode.PRODUCT_NOT_FOUND
      );
    }
    const updateProduct = await prismaClient.product.update({
      where: {
        id: parseInt(req.params.id),
      },
      data: product,
    });

    res.json(updateProduct);
  } catch (err) {
    throw new NotFoundException(
      "Product not found",
      ErrorCode.PRODUCT_NOT_FOUND
    );
  }
};

export const deleteProductController = async (req: Request, res: Response) => {
  try {
    const product = await prismaClient.product.delete({
      where: {
        id: parseInt(req.params.id!),
      },
    });

    res.json({
      message: "Product deleted successfully",
      data: product,
    });
  } catch (err) {
    throw new NotFoundException(
      "Product not found",
      ErrorCode.PRODUCT_NOT_FOUND
    );
  }
};

export const listProductcController = async (req: Request, res: Response) => {
  // http://localhost:8090/api/products
  // http://localhost:8090/api/products?skip=8
  // {
  //     count : 100,
  //     data : []
  // }

  const count = await prismaClient.product.count();
  const products = await prismaClient.product.findMany({
    skip: Number(req.query.skip) || 0,
    take: 5,
  });

  res.json({ count, data: products });
};

export const getProductByIdController = async (req: Request, res: Response) => {
  try {
    if (!req.params.id) {
      throw new NotFoundException(
        "Product ID is required",
        ErrorCode.PRODUCT_NOT_FOUND
      );
    }
    const product = await prismaClient.product.findFirstOrThrow({
      where: {
        id: parseInt(req.params.id),
      },
    });

    res.json(product);
  } catch (err) {
    throw new NotFoundException(
      "Product not found",
      ErrorCode.PRODUCT_NOT_FOUND
    );
  }
};

export const searchProductsController = async (req: Request, res: Response) => {


  const products = await prismaClient.product.findMany({
    where: {
      name: {
        search: String(req.query.q),
      },
      description: {
        search: String(req.query.q),
      },
      tags: {
        search: String(req.query.q),
      },
    },
  });

  sendSuccess(res, 200, "Fetch all product search successfully", products as any);
};
