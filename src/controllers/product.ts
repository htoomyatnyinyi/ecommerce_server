import { Request, Response } from "express";
import prisma from "../config/database";

export const createProduct = async (
  req: Request,
  res: Response
): Promise<any> => {
  res.send("Hi");
};

// Query parameters interface
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

export const getProducts = async (req: Request, res: Response) => {
  try {
    const {
      page = "1",
      limit = "10",
      search,
      category,
      minPrice,
      maxPrice,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query as GetProductsQuery;

    // Convert query params to numbers
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build the where clause
    const where: any = {
      AND: [],
    };

    if (search) {
      where.AND.push({
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      });
    }

    if (category) {
      where.AND.push({
        category: {
          categoryName: { equals: category, mode: "insensitive" },
        },
      });
    }

    if (minPrice || maxPrice) {
      where.AND.push({
        variants: {
          some: {
            price: {
              ...(minPrice && { gte: parseFloat(minPrice) }),
              ...(maxPrice && { lte: parseFloat(maxPrice) }),
            },
          },
        },
      });
    }

    // Get total count for pagination
    const totalCount = await prisma.product.count({ where });

    // Get products with variants and images
    const products = await prisma.product.findMany({
      where,
      skip,
      take: limitNum,
      include: {
        variants: {
          include: {
            variantOptions: true,
          },
        },
        images: true,
        category: true,
        // brand: true,
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitNum),
        currentPage: pageNum,
        limit: limitNum,
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
};

export const getProductById = async (
  req: Request,
  res: Response
): Promise<any> => {
  const userId = req.user?.id;
  const productId = req.params.id;

  try {
    console.log(userId, productId, "id check");
    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
      include: {
        variants: {
          include: {
            variantOptions: true,
          },
        },
        images: true,
        category: true,
        // brand: true,
      },
    });
    console.log(product);
    if (!product) {
      return res
        .status(404)
        .json({ message: "Product not found or unauthorized" });
    }
    res.status(200).json(product);
  } catch (error) {
    console.log(error);
  }
};

// Delete Product
export const deleteProduct = async (
  req: Request,
  res: Response
): Promise<any> => {
  const userId = req.user?.id;
  const productId = req.params.id;

  try {
    // Verify product exists and belongs to user
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        // userId, // if need specific user post
      },
    });

    if (!product) {
      return res
        .status(404)
        .json({ message: "Product not found or unauthorized" });
    }

    // Delete related data first (due to foreign key constraints)
    await prisma.$transaction([
      // Delete variant options
      prisma.variantOption.deleteMany({
        where: {
          variant: {
            productId,
          },
        },
      }),
      // Delete variants
      prisma.variant.deleteMany({
        where: {
          productId,
        },
      }),
      // Delete images
      prisma.image.deleteMany({
        where: {
          productId,
        },
      }),
      // Delete product
      prisma.product.delete({
        where: {
          id: productId,
          userId,
        },
      }),
    ]);

    return res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    return res.status(500).json({ message: "Failed to delete product" });
  }
};

// //%%%%%%
// export const createProduct = async (
//   req: Request,
//   res: Response
// ): Promise<any> => {
//   const userId = req.user?.id;
//   console.log(userId, "check", req.user?.id);

//   const { title, description, variants, images } = req.body as ProductRequest;

//   // Basic validation
//   if (
//     !title ||
//     !description ||
//     !Array.isArray(variants) ||
//     variants.length === 0
//   ) {
//     return res.status(400).json({
//       error: "Title, userId, and at least one variant are required.",
//     });
//   }

//   try {
//     // const response = await prisma.product.create({
//     //   data: {
//     //     title,
//     //     description,
//     //     user: {
//     //       connect: { id: userId }, // Connect to existing user
//     //     },
//     //     variants: {
//     //       create: variants.map(variant => ({
//     //         sku: variant.sku,
//     //         price: variant.price,
//     //         stock: variant.stock,
//     //         variantOptions: {
//     //           create: VariantOptions.
//     //         }
//     //       }))
//     //     }
//     //     variants: {
//     //       create: variants.map((v) => ({
//     //         sku: v.sku,
//     //         price: parseFloat(v.price.toString()),
//     //         stock: parseInt(v.stock.toString(), 10),
//     //         variantOptions: {
//     //           // Changed from 'options' to 'variantOptions'
//     //           create: v.options
//     //             ? v.options.map((opt) => ({
//     //                 attributeName: opt.attributeName,
//     //                 attributeValue: opt.attributeValue,
//     //               }))
//     //             : [],
//     //         },
//     //       })),
//     //     },
//     //     images: {
//     //       create: images
//     //         ? images.map((img) => ({
//     //             url: img.url,
//     //             altText: img.altText,
//     //             isPrimary: img.isPrimary || false,
//     //           }))
//     //         : [],
//     //     },
//     //   },
//     //   include: {
//     //     variants: {
//     //       include: {
//     //         variantOptions: true, // Include variant options in response
//     //       },
//     //     },
//     //     images: true,
//     //   },
//     // });

//     // const createdProductResponse = await prisma.product.create({
//     //   data: {
//     //     title,
//     //     description,
//     //     userId,
//     //     variants: {
//     //       create: variants?.map((variant): any => ({
//     //         sku: variant.sku,
//     //         price: parseFloat(variant.price.toString()),
//     //         stock: parseInt(variant.stock.toString(), 10),
//     //         // price: variant.price,

//     //         // stock: variant.stock,
//     //         discountPrice: variant.discountPrice,
//     //         variantOptions: {
//     //           create: variant.variantOptions?.map((variantOption): any => ({
//     //             attributeName: variantOption.attributeName,
//     //             attrubuteValue: variantOption.attributeValue,
//     //           })),
//     //         },
//     //       })),
//     //     },
//     //     images: {
//     //       create: images?.map((image) => ({
//     //         url: image.url,
//     //         altText: image.altText,
//     //         isPrimary: image.isPrimary,
//     //       })),
//     //     },
//     //   },
//     // });

//     res.status(201).json({ m: "createdProductResponse" });
//   } catch (error: any) {
//     console.error("Error creating product:", error);

//     if (error.code === "P2002") {
//       const conflictField = error.meta?.target?.join(", ");
//       return res.status(409).json({
//         error: `Product with these fields already exists: ${conflictField}`,
//       });
//     }

//     if (error.code === "P2025") {
//       return res.status(404).json({
//         error: "User not found",
//       });
//     }

//     res.status(500).json({
//       error: "Failed to create product.",
//       details:
//         process.env.NODE_ENV === "development" ? error.message : undefined,
//     });
//   }
// };
