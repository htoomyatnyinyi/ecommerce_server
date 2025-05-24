// import { PrismaClient } from "@prisma/client";
// const prisma = new PrismaClient();

// async function main() {
//   // Clear existing data (optional)
//   await prisma.stockHistory.deleteMany();
//   await prisma.image.deleteMany();
//   await prisma.variant.deleteMany();
//   await prisma.product.deleteMany();
//   await prisma.tag.deleteMany();
//   await prisma.category.deleteMany();
//   await prisma.user.deleteMany();

//   // Create users
//   await prisma.user.createMany({
//     data: [
//       {
//         email: "admin@example.com",
//         password: "$2b$10$ExampleHashedPassword", // In real app, hash properly
//         role: "ADMIN",
//         username: "admin",
//       },
//       {
//         email: "staff@example.com",
//         password: "$2b$10$ExampleHashedPassword",
//         role: "EMPLOYER",
//         username: "staff_member",
//       },
//       {
//         email: "customer@example.com",
//         password: "$2b$10$ExampleHashedPassword",
//         role: "USER",
//         username: "regular_customer",
//       },
//     ],
//   });

//   // Create categories
//   const electronics = await prisma.category.create({
//     data: {
//       name: "Electronics",
//     },
//   });

//   const audio = await prisma.category.create({
//     data: {
//       name: "Audio",
//       parentId: electronics.id,
//     },
//   });

//   const apparel = await prisma.category.create({
//     data: {
//       name: "Apparel",
//     },
//   });

//   const tshirts = await prisma.category.create({
//     data: {
//       name: "T-Shirts",
//       parentId: apparel.id,
//     },
//   });

//   // Create tags
//   const popularTag = await prisma.tag.create({
//     data: {
//       name: "popular",
//     },
//   });

//   const newArrivalTag = await prisma.tag.create({
//     data: {
//       name: "new-arrival",
//     },
//   });

//   // Create products
//   const headphones = await prisma.product.create({
//     data: {
//       name: "Premium Wireless Headphones",
//       sku: "AUD-WH-2024",
//       description:
//         "Noise-cancelling Bluetooth headphones with 30hr battery life",
//       price: 199.99,
//       stock: 45,
//       status: "active",
//       categoryId: audio.id,
//       tags: {
//         connect: [{ id: popularTag.id }, { id: newArrivalTag.id }],
//       },
//       variants: {
//         create: [
//           {
//             color: "Black",
//             stock: 25,
//             sku: "AUD-WH-2024-BK",
//             price: 199.99,
//           },
//           {
//             color: "Silver",
//             stock: 20,
//             sku: "AUD-WH-2024-SL",
//             price: 199.99,
//           },
//         ],
//       },
//       images: {
//         create: [
//           {
//             url: "https://images.unsplash.com/photo-1505852679233-d9fd70aff56d?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
//           },
//           {
//             url: "https://images.unsplash.com/photo-1505852679233-d9fd70aff56d?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
//           },
//         ],
//       },
//       stockHistory: {
//         create: [
//           { quantity: 50, reason: "initial-stock", location: "Warehouse A" },
//           { quantity: -5, reason: "sale", location: "Warehouse A" },
//         ],
//       },
//     },
//   });

//   const tshirt = await prisma.product.create({
//     data: {
//       name: "Organic Cotton T-Shirt",
//       sku: "APP-TS-1002",
//       description: "100% organic cotton unisex t-shirt",
//       price: 29.99,
//       stock: 82,
//       status: "active",
//       categoryId: tshirts.id,
//       tags: {
//         connect: { id: popularTag.id },
//       },
//       variants: {
//         create: [
//           {
//             size: "S",
//             stock: 20,
//             sku: "APP-TS-1002-S",
//             price: 29.99,
//           },
//           {
//             size: "M",
//             stock: 30,
//             sku: "APP-TS-1002-M",
//             price: 29.99,
//           },
//           {
//             size: "L",
//             stock: 32,
//             sku: "APP-TS-1002-L",
//             price: 29.99,
//           },
//         ],
//       },
//       images: {
//         create: [
//           { url: "https://example.com/images/tshirt-white-front.jpg" },
//           { url: "https://example.com/images/tshirt-white-back.jpg" },
//         ],
//       },
//       stockHistory: {
//         create: [
//           { quantity: 100, reason: "initial-stock", location: "Warehouse B" },
//           { quantity: -18, reason: "sale", location: "Warehouse B" },
//         ],
//       },
//     },
//   });

//   console.log("Database seeded successfully!");
//   console.log({
//     headphonesId: headphones.id,
//     tshirtId: tshirt.id,
//   });
// }

// main()
//   .catch((e) => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });

// // import prisma from "@/lib/prisma";

// // async function main() {
// //   // Seed Users
// //   const user = await prisma.user.create({
// //     data: {
// //       email: "hm@email.com",
// //       password: "hashed_password", // Ideally hash passwords in production
// //       name: "John Doe",
// //     },
// //   });
// //   console.log(user, "check return user");

// //   // Seed Products
// //   await prisma.product.createMany({
// //     data: [
// //       {
// //         title: "MacBook Pro",
// //         description: "Macbook Pro 15 inches and RAM 16 GB Storage 512 GB",
// //         price: 1999.99,
// //         inStock: true,
// //         userId: user.id,
// //         category: "IPHONE",
// //       },
// //       {
// //         title: "iPhone 15",
// //         description: "Iphone 15 with 4400 mAh battery and pink color",
// //         price: 999.99,
// //         inStock: true,
// //         userId: user.id,
// //         category: "IPHONE",
// //       },
// //       {
// //         title: "iPhone 13",
// //         description: "Iphone 13 with 4400 mAh battery and pink color",
// //         price: 788.99,
// //         inStock: true,
// //         userId: user.id,
// //         category: "IPHONE",
// //       },
// //       {
// //         title: "iPhone 13",
// //         description: "Iphone 13 with 4400 mAh battery and pink color",
// //         price: 788.99,
// //         inStock: true,
// //         userId: user.id,
// //         category: "IPHONE",
// //       },
// //     ],
// //   });

// //   console.log("✅ Seeding complete");
// // }

// // main()
// //   .catch((e) => {
// //     console.error(e);
// //     process.exit(1);
// //   })
// //   .finally(async () => {
// //     await prisma.$disconnect();
// //   });

// // // This is your Prisma schema file,
// // // learn more about it in the docs: https://pris.ly/d/prisma-schema

// // // Looking for ways to speed up your queries, or scale easily with your serverless or edge functions?
// // // Try Prisma Accelerate: https://pris.ly/cli/accelerate-init

// // generator client {
// //   provider = "prisma-client-js"
// //   // output   = "../generated/prisma" // Uncomment and adjust if you want to change the output directory
// // }

// // datasource db {
// //   provider = "mysql" // Assuming MySQL based on your original schema
// //   url      = env("DATABASE_URL")
// // }

// // model User {
// //   id        Int      @id @default(autoincrement())
// //   username  String?  @unique // Username could be unique
// //   fullName  String?
// //   email     String   @unique
// //   password  String
// //   address   String? // Consider a separate Address model if multiple addresses are needed
// //   phone     String?
// //   cart      Cart?
// //   orders    Order[]
// //   reviews   Review[] // Link Users to Reviews
// //   createdAt DateTime @default(now())
// //   updatedAt DateTime @updatedAt
// // }

// // model Product {
// //   id            Int              @id @default(autoincrement())
// //   name          String           @unique // Product names should ideally be unique or have unique identifiers
// //   description   String?
// //   // price       Float // Price might be better handled at the variant level or with decimal type for precision
// //   // stock       Int // Stock might be better handled at the variant level
// //   createdAt     DateTime         @default(now())
// //   updatedAt     DateTime         @updatedAt
// //   variants      ProductVariant[] // Link Product to its Variants
// //   reviews       Review[]         // Link Product to its Reviews
// //   images        Image[]          // Link Product to its Images
// //   orderItems    OrderItem[]      // Link Product to OrderItems (if no variants are used for an order)
// // }

// // model ProductVariant {
// //   id        Int      @id @default(autoincrement())
// //   product   Product  @relation(fields: [productId], references: [id])
// //   productId Int
// //   name      String   // e.g., "Small", "Red" - this could also be a combination of options
// //   sku       String?  @unique // Stock Keeping Unit - useful for inventory
// //   price     Decimal  @db.Decimal(10, 2) // Use Decimal for currency for precision
// //   stock     Int      @default(0) // Default stock to 0
// //   // You might want to add fields for specific options like color, size, etc.
// //   // color String?
// //   // size  String?
// //   orderItems OrderItem[] // Link ProductVariant to OrderItems
// //   createdAt DateTime @default(now())
// //   updatedAt DateTime @updatedAt // Added updatedAt for variants
// // }

// // model Review {
// //   id        Int      @id @default(autoincrement())
// //   product   Product  @relation(fields: [productId], references: [id])
// //   productId Int
// //   user      User     @relation(fields: [userId], references: [id])
// //   userId    Int
// //   rating    Int      @ Швеции(1, 5) // Assuming rating is between 1 and 5
// //   comment   String?  @db.Text // Use @db.Text for potentially longer comments
// //   createdAt DateTime @default(now())
// //   updatedAt DateTime @updatedAt // Added updatedAt for reviews

// //   @@unique([productId, userId]) // A user can only leave one review per product
// // }

// // model Image {
// //   id        Int      @id @default(autoincrement())
// //   url       String
// //   altText   String? // Added altText for accessibility and SEO
// //   productId Int
// //   product   Product  @relation(fields: [productId], references: [id])
// //   createdAt DateTime @default(now())
// //   updatedAt DateTime @updatedAt // Added updatedAt for images
// // }

// // model Cart {
// //   id        Int        @id @default(autoincrement())
// //   user      User       @relation(fields: [userId], references: [id])
// //   userId    Int        @unique // Each user has one cart
// //   items     CartItem[] // Link Cart to CartItems
// //   createdAt DateTime   @default(now())
// //   updatedAt DateTime   @updatedAt
// // }

// // model CartItem {
// //   id              Int             @id @default(autoincrement())
// //   cart            Cart            @relation(fields: [cartId], references: [id])
// //   cartId          Int
// //   product         Product?        @relation(fields: [productId], references: [id]) // Link to Product (if no variant)
// //   productId       Int?
// //   productVariant  ProductVariant? @relation(fields: [productVariantId], references: [id]) // Link to ProductVariant
// //   productVariantId Int?
// //   quantity        Int             @default(1) @db.Int // Ensure quantity is at least 1
// //   createdAt       DateTime        @default(now())
// //   updatedAt       DateTime        @updatedAt

// //   @@check([ (productId != null AND productVariantId == null) OR (productId == null AND productVariantId != null) ]) // Ensure either product or product variant is linked, but not both
// // }

// // enum OrderStatus {
// //   PENDING
// //   PROCESSING
// //   SHIPPED
// //   DELIVERED
// //   CANCELED
// //   REFUNDED // Added Refunded status
// // }

// // model Order {
// //   id              Int          @id @default(autoincrement())
// //   user            User         @relation(fields: [userId], references: [id])
// //   userId          Int
// //   items           OrderItem[]
// //   total           Decimal      @db.Decimal(10, 2) // Use Decimal for currency
// //   status          OrderStatus  @default(PENDING)
// //   shippingAddress String?
// //   billingAddress  String?
// //   paymentMethod   String?
// //   payment         Payment?     // Link Order to Payment
// //   createdAt       DateTime     @default(now())
// //   updatedAt       DateTime     @updatedAt
// // }

// // model OrderItem {
// //   id               Int             @id @default(autoincrement())
// //   order            Order           @relation(fields: [orderId], references: [id])
// //   orderId          Int
// //   product          Product?        @relation(fields: [productId], references: [id]) // Link to Product (if no variant)
// //   productId        Int?
// //   productVariant   ProductVariant? @relation(fields: [productVariantId], references: [id]) // Link to ProductVariant
// //   productVariantId Int?
// //   quantity         Int
// //   priceAtOrder     Decimal         @db.Decimal(10, 2) // Store the price at the time of order
// //   createdAt        DateTime        @default(now())
// //   updatedAt        DateTime        @updatedAt

// //    @@check([ (productId != null AND productVariantId == null) OR (productId == null AND productVariantId != null) ]) // Ensure either product or product variant is linked, but not both
// // }

// // model Payment {
// //   id            Int      @id @default(autoincrement())
// //   order         Order    @relation(fields: [orderId], references: [id])
// //   orderId       Int      @unique // One payment per order
// //   amount        Decimal  @db.Decimal(10, 2) // Use Decimal for currency
// //   status        String   // e.g., "completed", "failed", "refunded"
// //   transactionId String   @unique // Transaction ID should be unique
// //   provider      String?  // e.g., "Stripe", "PayPal"
// //   createdAt     DateTime @default(now())
// //   updatedAt     DateTime @updatedAt // Added updatedAt for payments
// // }
// // // ###############

// // // model User {
// // //   id       Int      @id @default(autoincrement())
// // //   email    String   @unique
// // //   password String
// // //   cart     Cart?
// // //   orders   Order[]
// // // }

// // // model Product {
// // //   id          Int      @id @default(autoincrement())
// // //   name        String
// // //   description String
// // //   price       Float
// // //   stock       Int
// // //   categories  Category[]
// // //   images      Image[]
// // //   createdAt   DateTime @default(now())
// // // }

// // // model Category {
// // //   id       Int      @id @default(autoincrement())
// // //   name     String
// // //   products Product[]
// // // }

// // // model Cart {
// // //   id         Int       @id @default(autoincrement())
// // //   user       User      @relation(fields: [userId], references: [id])
// // //   userId     Int
// // //   items      CartItem[]
// // //   createdAt  DateTime  @default(now())
// // // }

// // // model CartItem {
// // //   id        Int     @id @default(autoincrement())
// // //   cart      Cart    @relation(fields: [cartId], references: [id])
// // //   cartId    Int
// // //   product   Product @relation(fields: [productId], references: [id])
// // //   productId Int
// // //   quantity  Int     @default(1)
// // // }

// // // model Order {
// // //   id        Int       @id @default(autoincrement())
// // //   user      User      @relation(fields: [userId], references: [id])
// // //   userId    Int
// // //   items     OrderItem[]
// // //   total     Float
// // //   status    String    @default("pending")
// // //   createdAt DateTime  @default(now())
// // // }

// // // model OrderItem {
// // //   id        Int     @id @default(autoincrement())
// // //   order     Order   @relation(fields: [orderId], references: [id])
// // //   orderId   Int
// // //   product   Product @relation(fields: [productId], references: [id])
// // //   productId Int
// // //   quantity  Int
// // //   price     Float
// // // } , does this backend for Ecommerce is enough ?

// // ///////////////////////////
// // // model Product {
// // //   id          Int      @id @default(autoincrement())
// // //   name        String
// // //   description String
// // //   price       Float
// // //   stock       Int
// // //   categories  Category[]
// // //   images      Image[]
// // //   createdAt   DateTime @default(now())
// // // }

// // // model Category {
// // //   id       Int      @id @default(autoincrement())
// // //   name     String
// // //   products Product[]
// // // }

// // // model User {
// // //   id       Int      @id @default(autoincrement())
// // //   email    String   @unique
// // //   password String
// // //   cart     Cart?
// // //   orders   Order[]
// // // }

// // // model Cart {
// // //   id         Int       @id @default(autoincrement())
// // //   user       User      @relation(fields: [userId], references: [id])
// // //   userId     Int
// // //   items      CartItem[]
// // //   createdAt  DateTime  @default(now())
// // // }

// // // model CartItem {
// // //   id        Int     @id @default(autoincrement())
// // //   cart      Cart    @relation(fields: [cartId], references: [id])
// // //   cartId    Int
// // //   product   Product @relation(fields: [productId], references: [id])
// // //   productId Int
// // //   quantity  Int     @default(1)
// // // }

// // // model Order {
// // //   id        Int       @id @default(autoincrement())
// // //   user      User      @relation(fields: [userId], references: [id])
// // //   userId    Int
// // //   items     OrderItem[]
// // //   total     Float
// // //   status    String    @default("pending")
// // //   createdAt DateTime  @default(now())
// // // }

// // // model OrderItem {
// // //   id        Int     @id @default(autoincrement())
// // //   order     Order   @relation(fields: [orderId], references: [id])
// // //   orderId   Int
// // //   product   Product @relation(fields: [productId], references: [id])
// // //   productId Int
// // //   quantity  Int
// // //   price     Float
// // // } , does this backend for Ecommerce is enough ?
