import { Request, Response } from "express";
import prisma from "../config/database";
import { successResponse, errorResponse } from "../utils/response";
import { Decimal } from "@prisma/client/runtime/library";

interface GetProductsQuery {
  page?: string;
  limit?: string;
  search?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  sortBy?: "price" | "createdAt" | "title";
  sortOrder?: "asc" | "desc";
}

// Create a new product
export const createProduct = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return errorResponse(res, "Unauthorized: User not authenticated", 401);
    }

    const { title, description, categoryId, variants, images } = req.body;

    if (!categoryId || !title) {
      return errorResponse(res, "Missing required fields", 400);
    }

    const createdProduct = await prisma.product.create({
      data: {
        title,
        description,
        categoryId,
        userId: userId,
        variants: {
          create: variants?.map((variant: any) => ({
            sku: variant.sku,
            price: variant.price,
            discountPrice: variant.discountPrice,
            stock: variant.stock,
            color: variant.color,
            size: variant.size,
          })),
        },
        images: {
          create: images?.map((image: any) => ({
            url: image.url,
            altText: image.altText,
            isPrimary: image.isPrimary,
          })),
        },
      },
      include: {
        variants: true,
        images: true,
      },
    });

    return successResponse(
      res,
      createdProduct,
      "Product created successfully",
      201
    );
  } catch (error) {
    return errorResponse(res, "Failed to create product", 400, error);
  }
};

// Get all products with filters and pagination
export const getProducts = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const {
      page = "1",
      limit = "10",
      search,
      category,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query as GetProductsQuery;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      AND: [],
    };

    if (search) {
      where.AND.push({
        OR: [
          { title: { contains: search } },
          { description: { contains: search } },
        ],
      });
    }

    if (category) {
      where.AND.push({
        category: {
          categoryName: { equals: category },
        },
      });
    }

    const { minPrice, maxPrice } = req.query as GetProductsQuery;
    if (minPrice || maxPrice) {
      const priceFilter: any = {};
      if (minPrice) priceFilter.gte = new Decimal(minPrice);
      if (maxPrice) priceFilter.lte = new Decimal(maxPrice);

      where.AND.push({
        variants: {
          some: {
            price: priceFilter,
          },
        },
      });
    }

    const totalCount = await prisma.product.count({ where });

    const responseProducts = await prisma.product.findMany({
      where,
      skip,
      take: limitNum,
      include: {
        images: {
          select: {
            id: true,
            url: true,
            altText: true,
            isPrimary: true,
          },
        },
        variants: {
          select: {
            id: true,
            sku: true,
            price: true,
            discountPrice: true,
            stock: true,
            color: true,
            size: true,
          },
        },
        category: true,
      },
      orderBy: {
        [sortBy as string]: sortOrder as "asc" | "desc",
      },
    });

    return successResponse(res, {
      products: responseProducts,
      pagination: {
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitNum),
        currentPage: pageNum,
        limit: limitNum,
      },
    });
  } catch (error) {
    return errorResponse(res, "Failed to fetch products", 400, error);
  }
};

// Get single product by ID
export const getProductById = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const productId: any = req.params.id;

    if (!productId) {
      return errorResponse(res, "Product ID is required", 400);
    }

    const responseProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        images: true,
        variants: true,
        category: true,
        productBrands: true,
      },
    });

    if (!responseProduct) {
      return errorResponse(res, "Product not found", 404);
    }

    return successResponse(res, responseProduct);
  } catch (error) {
    return errorResponse(res, "Failed to fetch product", 400, error);
  }
};

// Delete product
export const deleteProduct = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const productId: any = req.params.id;

    if (!productId) {
      return errorResponse(res, "Product ID is required", 400);
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return errorResponse(res, "Product not found", 404);
    }

    await prisma.$transaction([
      prisma.image.deleteMany({ where: { productId } }),
      prisma.variant.deleteMany({ where: { productId } }),
      prisma.productBrands.deleteMany({ where: { productId } }),
      prisma.product.delete({ where: { id: productId } }),
    ]);

    return successResponse(res, null, "Product deleted successfully");
  } catch (error) {
    return errorResponse(res, "Failed to delete product", 500, error);
  }
};
