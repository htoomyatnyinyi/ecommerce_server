import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Clear existing data (optional)
  await prisma.stockHistory.deleteMany();
  await prisma.image.deleteMany();
  await prisma.variant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  await prisma.user.createMany({
    data: [
      {
        email: "admin@example.com",
        password: "$2b$10$ExampleHashedPassword", // In real app, hash properly
        role: "ADMIN",
        username: "admin",
      },
      {
        email: "staff@example.com",
        password: "$2b$10$ExampleHashedPassword",
        role: "EMPLOYER",
        username: "staff_member",
      },
      {
        email: "customer@example.com",
        password: "$2b$10$ExampleHashedPassword",
        role: "USER",
        username: "regular_customer",
      },
    ],
  });

  // Create categories
  const electronics = await prisma.category.create({
    data: {
      name: "Electronics",
    },
  });

  const audio = await prisma.category.create({
    data: {
      name: "Audio",
      parentId: electronics.id,
    },
  });

  const apparel = await prisma.category.create({
    data: {
      name: "Apparel",
    },
  });

  const tshirts = await prisma.category.create({
    data: {
      name: "T-Shirts",
      parentId: apparel.id,
    },
  });

  // Create tags
  const popularTag = await prisma.tag.create({
    data: {
      name: "popular",
    },
  });

  const newArrivalTag = await prisma.tag.create({
    data: {
      name: "new-arrival",
    },
  });

  // Create products
  const headphones = await prisma.product.create({
    data: {
      name: "Premium Wireless Headphones",
      sku: "AUD-WH-2024",
      description:
        "Noise-cancelling Bluetooth headphones with 30hr battery life",
      price: 199.99,
      stock: 45,
      status: "active",
      categoryId: audio.id,
      tags: {
        connect: [{ id: popularTag.id }, { id: newArrivalTag.id }],
      },
      variants: {
        create: [
          {
            color: "Black",
            stock: 25,
            sku: "AUD-WH-2024-BK",
            price: 199.99,
          },
          {
            color: "Silver",
            stock: 20,
            sku: "AUD-WH-2024-SL",
            price: 199.99,
          },
        ],
      },
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1505852679233-d9fd70aff56d?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            altText: "img",
          },
          {
            url: "https://images.unsplash.com/photo-1505852679233-d9fd70aff56d?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            altText: "img",
          },
        ],
      },
      stockHistory: {
        create: [
          { quantity: 50, reason: "initial-stock", location: "Warehouse A" },
          { quantity: -5, reason: "sale", location: "Warehouse A" },
        ],
      },
    },
  });

  const tshirt = await prisma.product.create({
    data: {
      name: "Organic Cotton T-Shirt",
      sku: "APP-TS-1002",
      description: "100% organic cotton unisex t-shirt",
      price: 29.99,
      stock: 82,
      status: "active",
      categoryId: tshirts.id,
      tags: {
        connect: { id: popularTag.id },
      },
      variants: {
        create: [
          {
            size: "S",
            stock: 20,
            sku: "APP-TS-1002-S",
            price: 29.99,
          },
          {
            size: "M",
            stock: 30,
            sku: "APP-TS-1002-M",
            price: 29.99,
          },
          {
            size: "L",
            stock: 32,
            sku: "APP-TS-1002-L",
            price: 29.99,
          },
        ],
      },
      images: {
        create: [
          {
            url: "https://example.com/images/tshirt-white-front.jpg",
            altText: "image",
          },
          {
            url: "https://example.com/images/tshirt-white-back.jpg",
            altText: "image",
          },
        ],
      },
      stockHistory: {
        create: [
          { quantity: 100, reason: "initial-stock", location: "Warehouse B" },
          { quantity: -18, reason: "sale", location: "Warehouse B" },
        ],
      },
    },
  });

  console.log("Database seeded successfully!");
  console.log({
    headphonesId: headphones.id,
    tshirtId: tshirt.id,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
