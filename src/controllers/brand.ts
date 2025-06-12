import { Request, Response } from "express";

import prisma from "../config/database";

export const createBrand = async (
  req: Request,
  res: Response
): Promise<any> => {
  const useId = req.user?.id;
  const { brandName } = req.body;

  try {
    const categoryResponse = await prisma.brand.create({
      data: {
        brandName,
      },
    });
    res.status(201).json(categoryResponse);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      message: "Failed create category ",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
};

export const getBrands = async (req: Request, res: Response): Promise<any> => {
  try {
    const brandResponse = await prisma.brand.findMany();
    res.status(200).json(brandResponse);
  } catch (error) {
    console.error("Error fetching brands:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch brand",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
};

export const getBrandById = async (
  req: Request,
  res: Response
): Promise<any> => {
  const brandId: string = req.params.id;

  try {
    const categoryResponse = await prisma.category.findUnique({
      where: { id: brandId },
    });
    res.status(200).json(categoryResponse);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch category",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
};
