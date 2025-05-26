
model Product {
  id          String    @id @default(uuid()) // Or @default(autoincrement()) for integer IDs
  name        String
  description String?   @db.Text // Optional description, allows longer text
  slug        String    @unique // Good for SEO
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  // Relationships
  variants    Variant[] // One-to-many relationship with Variant
  images      Image[]   // One-to-many relationship with Image

  // Optional: If you have Brands and Categories
  // brand       Brand?    @relation(fields: [brandId], references: [id])
  // brandId     String?
  // category    Category? @relation(fields: [categoryId], references: [id])
  // categoryId  String?
}

model Variant {
  id        String   @id @default(uuid())
  sku       String   @unique // SKU is unique for each variant
  price     Decimal  @db.Decimal(10, 2) // Store prices with precision
  stock     Int      @default(0) // Current stock level
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Foreign key to Product
  product   Product @relation(fields: [productId], references: [id])
  productId String

  // Relationships
  options   VariantOption[] // One-to-many relationship with VariantOption
  // You might also have a direct 'image' field here if each variant has its own primary image
  // imageUrl  String?
}

model VariantOption {
  id            String @id @default(uuid())
  attributeName String // e.g., "Color", "Size"
  attributeValue String // e.g., "Red", "Large"

  // Foreign key to Variant
  variant   Variant @relation(fields: [variantId], references: [id])
  variantId String

  @@unique([variantId, attributeName]) // Ensure only one value for an attribute per variant
}

model Image {
  id        String   @id @default(uuid())
  url       String
  altText   String?
  isPrimary Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Foreign key to Product
  product   Product @relation(fields: [productId], references: [id])
  productId String
}

// Optional: Brand and Category models
// model Brand {
//   id        String    @id @default(uuid())
//   name      String    @unique
//   products  Product[]
// }

// model Category {
//   id        String    @id @default(uuid())
//   name      String    @unique
//   products  Product[]
// }

// src/index.js
require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON request bodies
app.use(express.json());

// Basic route for testing server
app.get('/', (req, res) => {
  res.send('E-commerce API is running!');
});

// --- POST API for Products ---
app.post('/products', async (req, res) => {
  const { name, description, slug, variants, images } = req.body;

  // Basic validation (you'll want more robust validation in a real app)
  if (!name || !slug || !Array.isArray(variants) || variants.length === 0) {
    return res.status(400).json({ error: 'Name, slug, and at least one variant are required.' });
  }
  if (variants.some(v => !v.sku || typeof v.price === 'undefined' || typeof v.stock === 'undefined')) {
    return res.status(400).json({ error: 'Each variant must have SKU, price, and stock.' });
  }

  try {
    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        slug,
        variants: {
          create: variants.map(v => ({
            sku: v.sku,
            price: parseFloat(v.price), // Ensure price is a number
            stock: parseInt(v.stock, 10), // Ensure stock is an integer
            // If you have variant options, you'd create them here too
            options: {
              create: v.options ? v.options.map(opt => ({
                attributeName: opt.attributeName,
                attributeValue: opt.attributeValue
              })) : []
            }
          })),
        },
        images: {
          create: images ? images.map(img => ({
            url: img.url,
            altText: img.altText,
            isPrimary: img.isPrimary || false,
          })) : [],
        },
      },
      // You can include related data in the response if needed
      include: {
        variants: {
          include: {
            options: true,
          },
        },
        images: true,
      },
    });

    res.status(201).json(newProduct); // 201 Created
  } catch (error) {
    console.error('Error creating product:', error);
    if (error.code === 'P2002' && error.meta.target.includes('slug')) {
        return res.status(409).json({ error: 'Product with this slug already exists.' }); // 409 Conflict
    }
    res.status(500).json({ error: 'Failed to create product.', details: error.message });
  }
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Graceful shutdown for Prisma Client
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});// src/index.js
require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON request bodies
app.use(express.json());

// Basic route for testing server
app.get('/', (req, res) => {
  res.send('E-commerce API is running!');
});

// --- POST API for Products ---
app.post('/products', async (req, res) => {
  const { name, description, slug, variants, images } = req.body;

  // Basic validation (you'll want more robust validation in a real app)
  if (!name || !slug || !Array.isArray(variants) || variants.length === 0) {
    return res.status(400).json({ error: 'Name, slug, and at least one variant are required.' });
  }
  if (variants.some(v => !v.sku || typeof v.price === 'undefined' || typeof v.stock === 'undefined')) {
    return res.status(400).json({ error: 'Each variant must have SKU, price, and stock.' });
  }

  try {
    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        slug,
        variants: {
          create: variants.map(v => ({
            sku: v.sku,
            price: parseFloat(v.price), // Ensure price is a number
            stock: parseInt(v.stock, 10), // Ensure stock is an integer
            // If you have variant options, you'd create them here too
            options: {
              create: v.options ? v.options.map(opt => ({
                attributeName: opt.attributeName,
                attributeValue: opt.attributeValue
              })) : []
            }
          })),
        },
        images: {
          create: images ? images.map(img => ({
            url: img.url,
            altText: img.altText,
            isPrimary: img.isPrimary || false,
          })) : [],
        },
      },
      // You can include related data in the response if needed
      include: {
        variants: {
          include: {
            options: true,
          },
        },
        images: true,
      },
    });

    res.status(201).json(newProduct); // 201 Created
  } catch (error) {
    console.error('Error creating product:', error);
    if (error.code === 'P2002' && error.meta.target.includes('slug')) {
        return res.status(409).json({ error: 'Product with this slug already exists.' }); // 409 Conflict
    }
    res.status(500).json({ error: 'Failed to create product.', details: error.message });
  }
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Graceful shutdown for Prisma Client
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});// src/index.js
require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON request bodies
app.use(express.json());

// Basic route for testing server
app.get('/', (req, res) => {
  res.send('E-commerce API is running!');
});

// --- POST API for Products ---
app.post('/products', async (req, res) => {
  const { name, description, slug, variants, images } = req.body;

  // Basic validation (you'll want more robust validation in a real app)
  if (!name || !slug || !Array.isArray(variants) || variants.length === 0) {
    return res.status(400).json({ error: 'Name, slug, and at least one variant are required.' });
  }
  if (variants.some(v => !v.sku || typeof v.price === 'undefined' || typeof v.stock === 'undefined')) {
    return res.status(400).json({ error: 'Each variant must have SKU, price, and stock.' });
  }

  try {
    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        slug,
        variants: {
          create: variants.map(v => ({
            sku: v.sku,
            price: parseFloat(v.price), // Ensure price is a number
            stock: parseInt(v.stock, 10), // Ensure stock is an integer
            // If you have variant options, you'd create them here too
            options: {
              create: v.options ? v.options.map(opt => ({
                attributeName: opt.attributeName,
                attributeValue: opt.attributeValue
              })) : []
            }
          })),
        },
        images: {
          create: images ? images.map(img => ({
            url: img.url,
            altText: img.altText,
            isPrimary: img.isPrimary || false,
          })) : [],
        },
      },
      // You can include related data in the response if needed
      include: {
        variants: {
          include: {
            options: true,
          },
        },
        images: true,
      },
    });

    res.status(201).json(newProduct); // 201 Created
  } catch (error) {
    console.error('Error creating product:', error);
    if (error.code === 'P2002' && error.meta.target.includes('slug')) {
        return res.status(409).json({ error: 'Product with this slug already exists.' }); // 409 Conflict
    }
    res.status(500).json({ error: 'Failed to create product.', details: error.message });
  }
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Graceful shutdown for Prisma Client
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});



// import { NextResponse } from "next/server";
// import prisma from "@/lib/prisma";

// export async function GET(request: Request) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const page = parseInt(searchParams.get("page") || "1");
//     const limit = parseInt(searchParams.get("limit") || "10");
//     const status = searchParams.get("status");
//     const categoryId = searchParams.get("categoryId");

//     const where = {
//       ...(status && { status: status as "active" | "inactive" }),
//       ...(categoryId && { categoryId: parseInt(categoryId) }),
//     };

//     const products = await prisma.product.findMany({
//       where,
//       skip: (page - 1) * limit,
//       take: limit,
//       include: {
//         category: true,
//         variants: true,
//         images: true,
//       },
//       orderBy: {
//         createdAt: "desc",
//       },
//     });

//     const total = await prisma.product.count({ where });

//     return NextResponse.json({
//       data: products,
//       meta: {
//         total,
//         page,
//         last_page: Math.ceil(total / limit),
//       },
//     });
//   } catch (error) {
//     return NextResponse.json(
//       { error: "Failed to fetch products" },
//       { status: 500 }
//     );
//   }
// }

// export async function POST(request: Request) {
//   try {
//     const body = await request.json();

//     // Validate required fields
//     if (!body.name || !body.sku || !body.price || !body.stock) {
//       return NextResponse.json(
//         { error: "Missing required fields" },
//         { status: 400 }
//       );
//     }

//     const product = await prisma.product.create({
//       data: {
//         name: body.name,
//         sku: body.sku,
//         description: body.description,
//         price: parseFloat(body.price),
//         stock: parseInt(body.stock),
//         status: body.status || "active",
//         categoryId: body.categoryId ? parseInt(body.categoryId) : null,
//         variants: body.variants
//           ? {
//               create: body.variants.map((v: any) => ({
//                 color: v.color,
//                 size: v.size,
//                 stock: v.stock,
//                 sku: v.sku,
//                 price: v.price ? parseFloat(v.price) : null,
//               })),
//             }
//           : undefined,
//         images: body.images
//           ? {
//               create: body.images.map((img: any) => ({
//                 url: img.url,
//               })),
//             }
//           : undefined,
//       },
//       include: {
//         variants: true,
//         images: true,
//         category: true,
//       },
//     });

//     // Create stock history record
//     await prisma.stockHistory.create({
//       data: {
//         productId: product.id,
//         quantity: product.stock,
//         reason: "initial stock",
//       },
//     });

//     return NextResponse.json(product, { status: 201 });
//   } catch (error: any) {
//     if (error.code === "P2002") {
//       return NextResponse.json(
//         { error: "SKU already exists" },
//         { status: 409 }
//       );
//     }
//     return NextResponse.json(
//       { error: "Failed to create product" },
//       { status: 500 }
//     );
//   }
// }

// // import prisma from "@/lib/prisma";
// // import { NextResponse } from "next/server";

// // export async function GET() {
// //   try {
// //     const products = await prisma.product.findMany();
// //     // console.log(products, " all data");
// //     return NextResponse.json(products);
// //   } catch (error) {
// //     console.error("Error Getting Data", error);
// //   } finally {
// //     await prisma.$disconnect();
// //   }
// // }
 

// ID ID IDBCursor
// import { NextResponse } from "next/server";
// import prisma from "@/lib/prisma";

// // GET single product
// export async function GET(
//   request: Request,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const product = await prisma.product.findUnique({
//       where: { id: parseInt(params.id) },
//       include: {
//         category: true,
//         variants: true,
//         images: true,
//         stockHistory: {
//           orderBy: {
//             createdAt: "desc",
//           },
//           take: 10,
//         },
//       },
//     });

//     if (!product) {
//       return NextResponse.json({ error: "Product not found" }, { status: 404 });
//     }

//     return NextResponse.json(product);
//   } catch (error) {
//     return NextResponse.json(
//       { error: "Failed to fetch product" },
//       { status: 500 }
//     );
//   }
// }

// // UPDATE product
// export async function PUT(
//   request: Request,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const body = await request.json();
//     const productId = parseInt(params.id);

//     // Get current product to track stock changes
//     const currentProduct = await prisma.product.findUnique({
//       where: { id: productId },
//     });

//     const updatedProduct = await prisma.product.update({
//       where: { id: productId },
//       data: {
//         name: body.name,
//         description: body.description,
//         price: parseFloat(body.price),
//         status: body.status,
//         categoryId: body.categoryId ? parseInt(body.categoryId) : null,
//         // Handle variants and images updates as needed
//       },
//       include: {
//         variants: true,
//         images: true,
//         category: true,
//       },
//     });

//     // Track stock changes if they occurred
//     if (currentProduct && currentProduct.stock !== updatedProduct.stock) {
//       await prisma.stockHistory.create({
//         data: {
//           productId: productId,
//           quantity: updatedProduct.stock - currentProduct.stock,
//           reason: "manual adjustment",
//         },
//       });
//     }

//     return NextResponse.json(updatedProduct);
//   } catch (error) {
//     return NextResponse.json(
//       { error: "Failed to update product" },
//       { status: 500 }
//     );
//   }
// }

// // DELETE product
// export async function DELETE(
//   request: Request,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     // First delete related records due to foreign key constraints
//     await prisma.stockHistory.deleteMany({
//       where: { productId: parseInt(params.id) },
//     });

//     await prisma.variant.deleteMany({
//       where: { productId: parseInt(params.id) },
//     });

//     await prisma.image.deleteMany({
//       where: { productId: parseInt(params.id) },
//     });

//     // Then delete the product
//     await prisma.product.delete({
//       where: { id: parseInt(params.id) },
//     });

//     return NextResponse.json(
//       { message: "Product deleted successfully" },
//       { status: 200 }
//     );
//   } catch (error) {
//     return NextResponse.json(
//       { error: "Failed to delete product" },
//       { status: 500 }
//     );
//   }
// }
