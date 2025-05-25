import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const categoryId = searchParams.get("categoryId");

    const where = {
      ...(status && { status: status as "active" | "inactive" }),
      ...(categoryId && { categoryId: parseInt(categoryId) }),
    };

    const products = await prisma.product.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        category: true,
        variants: true,
        images: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const total = await prisma.product.count({ where });

    return NextResponse.json({
      data: products,
      meta: {
        total,
        page,
        last_page: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.sku || !body.price || !body.stock) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name: body.name,
        sku: body.sku,
        description: body.description,
        price: parseFloat(body.price),
        stock: parseInt(body.stock),
        status: body.status || "active",
        categoryId: body.categoryId ? parseInt(body.categoryId) : null,
        variants: body.variants
          ? {
              create: body.variants.map((v: any) => ({
                color: v.color,
                size: v.size,
                stock: v.stock,
                sku: v.sku,
                price: v.price ? parseFloat(v.price) : null,
              })),
            }
          : undefined,
        images: body.images
          ? {
              create: body.images.map((img: any) => ({
                url: img.url,
              })),
            }
          : undefined,
      },
      include: {
        variants: true,
        images: true,
        category: true,
      },
    });

    // Create stock history record
    await prisma.stockHistory.create({
      data: {
        productId: product.id,
        quantity: product.stock,
        reason: "initial stock",
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "SKU already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}

// import prisma from "@/lib/prisma";
// import { NextResponse } from "next/server";

// export async function GET() {
//   try {
//     const products = await prisma.product.findMany();
//     // console.log(products, " all data");
//     return NextResponse.json(products);
//   } catch (error) {
//     console.error("Error Getting Data", error);
//   } finally {
//     await prisma.$disconnect();
//   }
// }
 

ID ID IDBCursor
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET single product
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        category: true,
        variants: true,
        images: true,
        stockHistory: {
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

// UPDATE product
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const productId = parseInt(params.id);

    // Get current product to track stock changes
    const currentProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        name: body.name,
        description: body.description,
        price: parseFloat(body.price),
        status: body.status,
        categoryId: body.categoryId ? parseInt(body.categoryId) : null,
        // Handle variants and images updates as needed
      },
      include: {
        variants: true,
        images: true,
        category: true,
      },
    });

    // Track stock changes if they occurred
    if (currentProduct && currentProduct.stock !== updatedProduct.stock) {
      await prisma.stockHistory.create({
        data: {
          productId: productId,
          quantity: updatedProduct.stock - currentProduct.stock,
          reason: "manual adjustment",
        },
      });
    }

    return NextResponse.json(updatedProduct);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

// DELETE product
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // First delete related records due to foreign key constraints
    await prisma.stockHistory.deleteMany({
      where: { productId: parseInt(params.id) },
    });

    await prisma.variant.deleteMany({
      where: { productId: parseInt(params.id) },
    });

    await prisma.image.deleteMany({
      where: { productId: parseInt(params.id) },
    });

    // Then delete the product
    await prisma.product.delete({
      where: { id: parseInt(params.id) },
    });

    return NextResponse.json(
      { message: "Product deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
