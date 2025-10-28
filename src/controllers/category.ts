import type { Request, Response, NextFunction } from "express";
import { prismaClient } from "../index.js";
import { NotFoundException } from "../exceptions/not-found.js";
import { ErrorCode } from "../exceptions/root.js";
import sendResponse from "../utils/response.js";
import { BadRequestException } from "../exceptions/bad-request.js";

// Get all categories with their subcategories
export const getAllCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const categories = await prismaClient.category.findMany({
      orderBy: {
        displayOrder: "asc",
      },
      include: {
        subcategories: {
          orderBy: {
            displayOrder: "asc",
          },
        },
      },
    });

    sendResponse(res, 200, "Categories retrieved successfully", categories as any);
  } catch (error) {
    next(error);
  }
};

// Get category by ID
export const getCategoryById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const categoryId = parseInt(req.params.categoryId as any);

    const category = await prismaClient.category.findUnique({
      where: { id: categoryId },
      include: {
        subcategories: {
          orderBy: {
            displayOrder: "asc",
          },
        },
      },
    });

    if (!category) {
      return next(
        new NotFoundException(
          "Category not found",
          ErrorCode.CATEGORY_NOT_FOUND
        )
      );
    }

    return res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// Create new category (Admin only)
export const createCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, description, displayOrder } = req.body;

    // Validation
    if (!name) {
      // return res.status(400).json({
      //   success: false,
      //   message: "Category name is required",
      // });
      new BadRequestException(
        "Category name is required",
        ErrorCode.UNPROCESSABLE_ENTITY
      );
    }

    const category = await prismaClient.category.create({
      data: {
        name,
        description: description || null,
        displayOrder: displayOrder || 0,
      },
    });

    sendResponse(res, 201, "Category created successfully", category as any);
  } catch (error) {
    console.error("Error creating category:", error);
    next(error);
  }
};

// Update category (Admin only)
export const updateCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const categoryId = parseInt(req.params.categoryId as any);
    const { name, description, displayOrder } = req.body;

    const existingCategory = await prismaClient.category.findUnique({
      where: { id: categoryId },
    });

    if (!existingCategory) {
      return next(
        new NotFoundException(
          "Category not found",
          ErrorCode.CATEGORY_NOT_FOUND
        )
      );
    }

    const updatedCategory = await prismaClient.category.update({
      where: { id: categoryId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(displayOrder !== undefined && { displayOrder }),
      },
    });

    sendResponse(
      res,
      200,
      "Category updated successfully",
      updatedCategory as any
    );
  } catch (error) {
    next(error);
  }
};

// Delete category (Admin only)
export const deleteCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const categoryId = parseInt(req.params.categoryId as any);

    const existingCategory = await prismaClient.category.findUnique({
      where: { id: categoryId },
    });

    if (!existingCategory) {
      return next(
        new NotFoundException(
          "Category not found",
          ErrorCode.CATEGORY_NOT_FOUND
        )
      );
    }

    await prismaClient.category.delete({
      where: { id: categoryId },
    });

    sendResponse(res, 200, "Category deleted successfully");
  } catch (error) {
    next(error);
  }
};
