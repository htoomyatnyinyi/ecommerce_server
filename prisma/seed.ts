import { PrismaClient, Role } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding ...");

  // 1. Create Users
  const password = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      username: "admin",
      password,
      role: Role.ADMIN,
      isEmailVerified: true,
    },
  });

  const user = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      email: "user@example.com",
      username: "user",
      password,
      role: Role.USER,
      isEmailVerified: true,
    },
  });

  console.log("Users seeded:", { admin: admin.username, user: user.username });

  // 2. Create Categories
  const electronics = await prisma.category.upsert({
    where: { categoryName: "Electronics" },
    update: {},
    create: { categoryName: "Electronics" },
  });

  const clothing = await prisma.category.upsert({
    where: { categoryName: "Clothing" },
    update: {},
    create: { categoryName: "Clothing" },
  });

  console.log("Categories seeded:", {
    electronics: electronics.categoryName,
    clothing: clothing.categoryName,
  });

  // 3. Create Brands
  const apple = await prisma.brand.upsert({
    where: { brandName: "Apple" },
    update: {},
    create: { brandName: "Apple" },
  });

  const nike = await prisma.brand.upsert({
    where: { brandName: "Nike" },
    update: {},
    create: { brandName: "Nike" },
  });

  console.log("Brands seeded:", {
    apple: apple.brandName,
    nike: nike.brandName,
  });

  // 4. Create Products
  // Product 1: iPhone
  const iphone = await prisma.product.create({
    data: {
      title: "iPhone 15 Pro",
      description: "The ultimate iPhone.",
      categoryId: electronics.id,
      userId: admin.id,
      images: {
        create: [
          {
            url: "https://placehold.co/600x400?text=iPhone+Front",
            altText: "iPhone Front",
            isPrimary: true,
          },
          {
            url: "https://placehold.co/600x400?text=iPhone+Back",
            altText: "iPhone Back",
          },
        ],
      },
      variants: {
        create: [
          {
            sku: "IP15P-BLK-128",
            color: "Black Titanium",
            size: "128GB",
            price: 999.0,
            stock: 50,
          },
          {
            sku: "IP15P-WHT-256",
            color: "White Titanium",
            size: "256GB",
            price: 1099.0,
            stock: 30,
          },
        ],
      },
      productBrands: {
        create: {
          brandId: apple.id,
        },
      },
    },
  });

  // Product 2: Air Max
  const airmax = await prisma.product.create({
    data: {
      title: "Nike Air Max 90",
      description: "Nothing as fly, nothing as comfortable.",
      categoryId: clothing.id,
      userId: admin.id,
      images: {
        create: [
          {
            url: "https://placehold.co/600x400?text=AirMax+Side",
            altText: "Air Max Side",
            isPrimary: true,
          },
        ],
      },
      variants: {
        create: [
          {
            sku: "AM90-RED-42",
            color: "Red",
            size: "42",
            price: 129.99,
            stock: 100,
          },
          {
            sku: "AM90-BLK-44",
            color: "Black",
            size: "44",
            price: 129.99,
            stock: 80,
          },
        ],
      },
      productBrands: {
        create: {
          brandId: nike.id,
        },
      },
    },
  });

  console.log("Products seeded:", {
    iphone: iphone.title,
    airmax: airmax.title,
  });

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
