import { Request, Response } from "express";
import prisma from "../config/database";
import { successResponse, errorResponse } from "../utils/response";

export const createCategory = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const userId = req.user?.id;
    if (!userId) return errorResponse(res, "Unauthorized", 401);

    const { name } = req.body;
    if (!name) return errorResponse(res, "Category name is required", 400);

    const category = await prisma.category.create({
      data: { categoryName: name },
    });

    return successResponse(res, category, "Category created successfully", 201);
  } catch (error) {
    return errorResponse(res, "Failed to create category", 500, error);
  }
};

export const getCategory = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { categoryName: "asc" },
    });
    return successResponse(res, categories, "Categories fetched successfully");
  } catch (error) {
    return errorResponse(res, "Failed to fetch categories", 500, error);
  }
};
