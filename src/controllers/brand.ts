import { Request, Response } from "express";
import prisma from "../config/database";
import { successResponse, errorResponse } from "../utils/response";

export const createBrand = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { brandName } = req.body;
    if (!brandName) return errorResponse(res, "Brand name is required", 400);

    const brand = await prisma.brand.create({
      data: { brandName },
    });
    return successResponse(res, brand, "Brand created successfully", 201);
  } catch (error) {
    return errorResponse(res, "Failed to create brand", 500, error);
  }
};

export const getBrands = async (req: Request, res: Response): Promise<any> => {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: { brandName: "asc" },
    });
    return successResponse(res, brands, "Brands fetched successfully");
  } catch (error) {
    return errorResponse(res, "Failed to fetch brands", 500, error);
  }
};

export const getBrandById = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const brandId = req.params.id as string;
    const brand = await prisma.brand.findUnique({
      where: { id: brandId },
    });

    if (!brand) return errorResponse(res, "Brand not found", 404);

    return successResponse(res, brand, "Brand fetched successfully");
  } catch (error) {
    return errorResponse(res, "Failed to fetch brand", 500, error);
  }
};
