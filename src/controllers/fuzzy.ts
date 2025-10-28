import type { NextFunction, Request, Response } from "express";
import { prismaClient } from "../index.js";
import type {
  SaveAssessmentRequest,
  BuildingAssessmentResponse,
} from "../types/assessment.js";
import sendResponse from "../utils/response.js";

/**
 * POST /api/assessments
 * Save building assessment dari Flutter app
 * Requires authentication
 */
export const saveAssessment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data: SaveAssessmentRequest = req.body;
    const userId = req.user?.id; // Dari auth middleware

    // Validasi input
    if (
      !data.nameBuilding ||
      !data.finalStatus ||
      data.fuzzyScore === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: nameBuilding, finalStatus, fuzzyScore",
      });
    }

    if (!data.categories || data.categories.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Categories data is required",
      });
    }

    // Simpan menggunakan Prisma transaction
    const building = await prismaClient.$transaction(async (tx) => {
      // 1. Create building record
      const newBuilding = await tx.building.create({
        data: {
          userId: userId,
          nameBuilding: data.nameBuilding,
          finalStatus: data.finalStatus,
          fuzzyScore: data.fuzzyScore,
        },
      });

      // 2. Loop through categories
      for (const categoryData of data.categories) {
        // Create assessment for this category
        const assessment = await tx.assessment.create({
          data: {
            buildingId: newBuilding.id,
            categoryId: categoryData.categoryId,
            categoryValue: categoryData.categoryValue,
          },
        });

        // 3. Loop through subcategories
        for (const subData of categoryData.subcategories) {
          const subcategoryAssessment = await tx.subcategoryAssessment.create({
            data: {
              assessmentId: assessment.id,
              subcategoryId: subData.subcategoryId,
              subcategoryValue: subData.subcategoryValue,
            },
          });

          // 4. Loop through items
          for (const itemData of subData.items) {
            // Find or create item (upsert)
            const item = await tx.item.upsert({
              where: {
                subcategoryId_name: {
                  subcategoryId: subData.subcategoryId,
                  name: itemData.itemName,
                },
              },
              update: {},
              create: {
                subcategoryId: subData.subcategoryId,
                name: itemData.itemName,
              },
            });

            // Create item assessment
            await tx.itemAssessment.create({
              data: {
                subcategoryAssessmentId: subcategoryAssessment.id,
                itemId: item.id,
                damageValue: itemData.damageValue,
                condition:
                  itemData.condition ||
                  determineDamageCondition(itemData.damageValue),
                notes: itemData.notes ?? null,
              },
            });
          }
        }
      }

      // Return building dengan full relations
      return await tx.building.findUnique({
        where: { id: newBuilding.id },
        include: {
          assessments: {
            include: {
              category: true,
              subcategoryAssessments: {
                include: {
                  subcategory: true,
                  itemAssessments: {
                    include: {
                      item: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
    });

    // Transform ke format response
    const response = transformToBuildingResponse(building);

    return res.status(201).json({
      success: true,
      message: "Assessment saved successfully",
      data: response,
    });
  } catch (error) {
    console.error("Error saving assessment:", error);
    next(error);
  }
};

/**
 * GET /api/assessments/:buildingId
 * Get building assessment by ID
 * Requires authentication
 */
export const getAssessmentById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const buildingId = parseInt(req.params.buildingId as any);
    const userId = req.user?.id;

    if (isNaN(buildingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid building ID",
      });
    }

    const building = await prismaClient.building.findFirst({
      where: {
        id: buildingId,
        userId: userId, // Hanya bisa akses assessment milik user sendiri
      },
      include: {
        assessments: {
          include: {
            category: true,
            subcategoryAssessments: {
              include: {
                subcategory: true,
                itemAssessments: {
                  include: {
                    item: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!building) {
      return res.status(404).json({
        success: false,
        message: "Building not found or unauthorized",
      });
    }

    const response = transformToBuildingResponse(building);

    return res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("Error fetching assessment:", error);
    next(error);
  }
};

/**
 * GET /api/assessments
 * Get all building assessments for current user
 * Requires authentication
 */
export const getAllAssessments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;

    const buildings = await prismaClient.building.findMany({
      where: {
        userId: userId,
      },
      include: {
        assessments: {
          include: {
            category: true,
            subcategoryAssessments: {
              include: {
                subcategory: true,
                itemAssessments: {
                  include: {
                    item: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const response = buildings.map((building) =>
      transformToBuildingResponse(building)
    );

    // return res.status(200).json({
    //   success: true,
    //   data: response,
    // });

    sendResponse(
      res,
      200,
      "Fatch data assesments succesfully",
      response as any
    );
  } catch (error) {
    console.error("Error fetching assessments:", error);
    next(error);
  }
};

export const searchAssessments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;

    const buildings = await prismaClient.building.findMany({
      where: {
        userId: userId,
        OR: [
          {
            nameBuilding: {
              contains: String(req.query.q),
              mode: "insensitive", // Case-insensitive search
            },
          },
          {
            finalStatus: {
              contains: String(req.query.q),
              mode: "insensitive",
            },
          },
        ],
      },
      include: {
        assessments: {
          include: {
            category: true,
            subcategoryAssessments: {
              include: {
                subcategory: true,
                itemAssessments: {
                  include: {
                    item: true,
                  },
                },
              },
            },
          },
        },
      },
      // orderBy: {
      //   createdAt: "desc",
      // },
    });

    const response = buildings.map((building) =>
      transformToBuildingResponse(building)
    );

    // return res.status(200).json({
    //   success: true,
    //   data: response,
    // });

    sendResponse(
      res,
      200,
      "Search data assesments succesfully",
      response as any
    );
  } catch (error) {
    console.error("Error fetching assessments:", error);
    next(error);
  }
};

/**
 * GET /api/assessments/filter/date
 * Get assessments filtered by date (day/month/year)
 * Query params:
 *   - day: specific date (YYYY-MM-DD)
 *   - month: specific month (YYYY-MM)
 *   - year: specific year (YYYY)
 * Requires authentication
 */
export const getAssessmentsByDate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const { day, month, year } = req.query;

    let startDate: Date;
    let endDate: Date;

    // Filter berdasarkan parameter yang diberikan (menggunakan UTC)
    if (day) {
      // Filter berdasarkan tanggal spesifik (YYYY-MM-DD) dalam UTC
      const [yearPart, monthPart, dayPart] = (day as string).split("-");
      if (!yearPart || !monthPart || !dayPart) {
        return res.status(400).json({
          success: false,
          message: "Invalid date format. Use YYYY-MM-DD",
        });
      }

      // Buat start of day (00:00:00.000 UTC)
      startDate = new Date(
        Date.UTC(
          parseInt(yearPart),
          parseInt(monthPart) - 1,
          parseInt(dayPart),
          0,
          0,
          0,
          0
        )
      );

      // Buat end of day (23:59:59.999 UTC)
      endDate = new Date(
        Date.UTC(
          parseInt(yearPart),
          parseInt(monthPart) - 1,
          parseInt(dayPart),
          23,
          59,
          59,
          999
        )
      );
    } else if (month) {
      // Filter berdasarkan bulan (YYYY-MM) dalam UTC
      const [yearPart, monthPart] = (month as string).split("-");
      if (!yearPart || !monthPart) {
        return res.status(400).json({
          success: false,
          message: "Invalid month format. Use YYYY-MM",
        });
      }
      // Start of month (UTC)
      startDate = new Date(
        Date.UTC(parseInt(yearPart), parseInt(monthPart) - 1, 1, 0, 0, 0, 0)
      );

      // End of month (UTC) - last day of month
      endDate = new Date(
        Date.UTC(parseInt(yearPart), parseInt(monthPart), 0, 23, 59, 59, 999)
      );
    } else if (year) {
      // Filter berdasarkan tahun (YYYY) dalam UTC
      const yearNum = parseInt(year as string);
      if (isNaN(yearNum)) {
        return res.status(400).json({
          success: false,
          message: "Invalid year format. Use YYYY",
        });
      }
      // Start of year (UTC)
      startDate = new Date(Date.UTC(yearNum, 0, 1, 0, 0, 0, 0));

      // End of year (UTC)
      endDate = new Date(Date.UTC(yearNum, 11, 31, 23, 59, 59, 999));
    } else {
      return res.status(400).json({
        success: false,
        message: "Please provide day, month, or year parameter",
      });
    }

    const buildings = await prismaClient.building.findMany({
      where: {
        userId: userId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        assessments: {
          include: {
            category: true,
            subcategoryAssessments: {
              include: {
                subcategory: true,
                itemAssessments: {
                  include: {
                    item: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const response = buildings.map((building) =>
      transformToBuildingResponse(building)
    );

    sendResponse(
      res,
      200,
      "Fetch assessments by date successfully",
      response as any
    );
  } catch (error) {
    console.error("Error fetching assessments by date:", error);
    next(error);
  }
};

/**
 * DELETE /api/assessments/:buildingId
 * Delete building assessment
 * Requires authentication
 */
export const deleteAssessment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const buildingId = parseInt(req.params.buildingId as any);
    const userId = req.user?.id;

    if (isNaN(buildingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid building ID",
      });
    }

    // Check ownership
    const building = await prismaClient.building.findFirst({
      where: {
        id: buildingId,
        userId: userId,
      },
    });

    if (!building) {
      return res.status(404).json({
        success: false,
        message: "Building not found or unauthorized",
      });
    }

    // Delete (cascade akan hapus semua related data)
    await prismaClient.building.delete({
      where: { id: buildingId },
    });

    return res.status(200).json({
      success: true,
      message: "Assessment deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting assessment:", error);
    next(error);
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Determine damage condition based on trapezoidal membership
 */
function determineDamageCondition(value: number): string {
  if (value <= 0.1) return "Baik";
  if (value <= 0.3) return "Rusak Ringan";
  if (value <= 0.65) return "Rusak Sedang";
  return "Rusak Berat";
}

/**
 * Transform Prisma response ke format BuildingAssessmentResponse
 */
function transformToBuildingResponse(
  building: any
): BuildingAssessmentResponse {
  return {
    id: building.id,
    nameBuilding: building.nameBuilding,
    finalStatus: building.finalStatus,
    fuzzyScore: building.fuzzyScore,
    createdAt: building.createdAt.toISOString(),
    updatedAt: building.updatedAt.toISOString(),
    categories: building.assessments.map((assessment: any) => ({
      id: assessment.category.id,
      name: assessment.category.name,
      description: assessment.category.description,
      categoryValue: assessment.categoryValue,
      displayOrder: assessment.category.displayOrder,
      subcategories: assessment.subcategoryAssessments.map(
        (subAssessment: any) => ({
          id: subAssessment.subcategory.id,
          name: subAssessment.subcategory.name,
          description: subAssessment.subcategory.description,
          subcategoryValue: subAssessment.subcategoryValue,
          displayOrder: subAssessment.subcategory.displayOrder,
          items: subAssessment.itemAssessments.map((itemAssessment: any) => ({
            id: itemAssessment.item.id,
            name: itemAssessment.item.name,
            damageValue: itemAssessment.damageValue,
            condition: itemAssessment.condition,
            notes: itemAssessment.notes,
            createdAt: itemAssessment.createdAt.toISOString(),
          })),
        })
      ),
    })),
  };
}
