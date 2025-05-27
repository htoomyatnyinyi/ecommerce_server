import { Request, Response } from "express";
import prisma from "../../config/database";

interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

interface CreateProductRequestBody {
  name: string;
  description?: string;
  price: number;
  stock: number;
  categoryId: string;
  brandId: string;
  variants?: Array<{ name: string; options: string[] }>;
  images?: string[];
}

export const postProduct = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  const userId = req.user?.id;
  const {
    name,
    description,
    price,
    stock,
    categoryId,
    brandId,
    variants,
    images,
  } = req.body as CreateProductRequestBody;

  // Basic input validation
  if (!userId) {
    return res
      .status(401)
      .json({ message: "Unauthorized: User not authenticated" });
  }
  if (!name || !price || !stock || !categoryId || !brandId) {
    return res.status(400).json({
      message:
        "Missing required fields: name, price, stock, categoryId, or brandId",
    });
  }
  if (price < 0 || stock < 0) {
    return res
      .status(400)
      .json({ message: "Price and stock must be non-negative" });
  }

  try {
    // Verify category and brand exist
    const [category, brand] = await Promise.all([
      prisma.category.findUnique({ where: { id: categoryId } }),
      prisma.brand.findUnique({ where: { id: brandId } }),
    ]);

    if (!category) {
      return res.status(400).json({ message: "Invalid categoryId" });
    }
    if (!brand) {
      return res.status(400).json({ message: "Invalid brandId" });
    }

    // Create product with related data in a transaction
    const product = await prisma.$transaction(async (tx) => {
      // Create product
      const newProduct = await tx.product.create({
        data: {
          name,
          description,
          price,
          stock,
          userId,
          categoryId,
          brandId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      // Create variants and their options
      if (variants && variants.length > 0) {
        for (const variant of variants) {
          await tx.variant.create({
            data: {
              productId: newProduct.id,
              name: variant.name,
              variantOptions: {
                create: variant.options.map((option) => ({
                  value: option,
                })),
              },
            },
          });
        }
      }

      // Create images
      if (images && images.length > 0) {
        await tx.image.createMany({
          data: images.map((url) => ({
            url,
            productId: newProduct.id,
          })),
        });
      }

      return newProduct;
    });

    // Fetch the complete product with relations
    const fullProduct = await prisma.product.findUnique({
      where: { id: product.id },
      include: {
        variants: {
          include: {
            variantOptions: true,
          },
        },
        images: true,
        category: true,
        brand: true,
      },
    });

    return res.status(201).json(fullProduct);
  } catch (error) {
    console.error("Create product error:", error);
    return res.status(500).json({ message: "Failed to create product" });
  } finally {
    await prisma.$disconnect();
  }
};
