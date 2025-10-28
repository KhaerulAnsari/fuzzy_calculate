import type { Request, Response, NextFunction } from "express";
import { prismaClient } from "../index.js";
import { NotFoundException } from "../exceptions/not-found.js";
import { ErrorCode } from "../exceptions/root.js";
import sendResponse from "../utils/response.js";

// Get all subcategories (optionally filter by categoryId)
export const getAllSubcategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const categoryId = req.query.categoryId
      ? parseInt(req.query.categoryId as string)
      : undefined;

    const subcategories = await prismaClient.subcategory.findMany({
      where: categoryId ? { categoryId } : (undefined as any),
      orderBy: {
        displayOrder: "asc",
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // return res.status(200).json({
    //   success: true,
    //   data: subcategories,
    // });

    sendResponse(res, 200, subcategories as any);
  } catch (error) {
    next(error);
  }
};

// Get subcategory by ID
export const getSubcategoryById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const subcategoryId = parseInt(req.params.subcategoryId as any);

    const subcategory = await prismaClient.subcategory.findUnique({
      where: { id: subcategoryId },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!subcategory) {
      return next(
        new NotFoundException(
          "Subcategory not found",
          ErrorCode.SUBCATGORY_NOT_FOUND
        )
      );
    }

    sendResponse(res, 200, subcategory as any);
  } catch (error) {
    next(error);
  }
};

// Create new subcategory (Admin only)
export const createSubcategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, description, categoryId, displayOrder } = req.body;

    // Validation
    if (!name || !categoryId) {
      return res.status(400).json({
        success: false,
        message: "Subcategory name and categoryId are required",
      });
    }

    // Check if category exists
    const category = await prismaClient.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return next(
        new NotFoundException(
          "Category not found",
          ErrorCode.CATEGORY_NOT_FOUND
        )
      );
    }

    const subcategory = await prismaClient.subcategory.create({
      data: {
        name,
        description: description || null,
        categoryId,
        displayOrder: displayOrder || 0,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    sendResponse(
      res,
      201,
      "Subcategory created successfully",
      subcategory as any
    );
  } catch (error) {
    next(error);
  }
};

// Update subcategory (Admin only)
export const updateSubcategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const subcategoryId = parseInt(req.params.subcategoryId as any);
    const { name, description, categoryId, displayOrder } = req.body;

    const existingSubcategory = await prismaClient.subcategory.findUnique({
      where: { id: subcategoryId },
    });

    if (!existingSubcategory) {
      return next(
        new NotFoundException(
          "Subcategory not found",
          ErrorCode.SUBCATGORY_NOT_FOUND
        )
      );
    }

    // If categoryId is being updated, check if new category exists
    if (categoryId && categoryId !== existingSubcategory.categoryId) {
      const category = await prismaClient.category.findUnique({
        where: { id: categoryId },
      });

      if (!category) {
        return next(
          new NotFoundException(
            "Category not found",
            ErrorCode.CATEGORY_NOT_FOUND
          )
        );
      }
    }

    const updatedSubcategory = await prismaClient.subcategory.update({
      where: { id: subcategoryId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(categoryId && { categoryId }),
        ...(displayOrder !== undefined && { displayOrder }),
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    sendResponse(
      res,
      200,
      "Subcategory updated successfully",
      updatedSubcategory as any
    );
  } catch (error) {
    next(error);
  }
};

// Delete subcategory (Admin only)
export const deleteSubcategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const subcategoryId = parseInt(req.params.subcategoryId as any);

    const existingSubcategory = await prismaClient.subcategory.findUnique({
      where: { id: subcategoryId },
    });

    if (!existingSubcategory) {
      return next(
        new NotFoundException(
          "Subcategory not found",
          ErrorCode.SUBCATGORY_NOT_FOUND
        )
      );
    }

    await prismaClient.subcategory.delete({
      where: { id: subcategoryId },
    });

    sendResponse(res, 200, "Subcategory deleted successfully");
  } catch (error) {
    next(error);
  }
};
