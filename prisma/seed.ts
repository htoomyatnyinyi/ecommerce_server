import {
  PrismaClient,
  Role,
  PaymentMethod,
  PaymentStatus,
  OrderStatus,
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clear existing data (optional, for fresh seeding)
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.review.deleteMany();
  await prisma.address.deleteMany();
  await prisma.image.deleteMany();
  await prisma.variantOption.deleteMany();
  await prisma.variant.deleteMany();
  await prisma.productBrands.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.emailVerificationToken.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.user.deleteMany();

  // Seed Users
  const user1 = await prisma.user.create({
    data: {
      username: "john_doe",
      email: "john@example.com",
      password: "hashed_password_123", // In practice, hash passwords
      role: Role.USER,
      isEmailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const user2 = await prisma.user.create({
    data: {
      username: "jane_smith",
      email: "jane@example.com",
      password: "hashed_password_456",
      role: Role.ADMIN,
      isEmailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Seed Categories
  const category1 = await prisma.category.create({
    data: {
      categoryName: "Electronics",
    },
  });

  const category2 = await prisma.category.create({
    data: {
      categoryName: "Clothing",
    },
  });

  // Seed Brands
  const brand1 = await prisma.brand.create({
    data: {
      brandName: "TechTrend",
    },
  });

  const brand2 = await prisma.brand.create({
    data: {
      brandName: "FashionHub",
    },
  });

  // Seed Products
  const product1 = await prisma.product.create({
    data: {
      title: "Smartphone X",
      description: "A high-end smartphone with advanced features.",
      categoryId: category1.id,
      userId: user1.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const product2 = await prisma.product.create({
    data: {
      title: "T-Shirt Classic",
      description: "Comfortable cotton t-shirt.",
      categoryId: category2.id,
      userId: user2.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Seed ProductBrands
  await prisma.productBrands.create({
    data: {
      brandId: brand1.id,
      productId: product1.id,
    },
  });

  await prisma.productBrands.create({
    data: {
      brandId: brand2.id,
      productId: product2.id,
    },
  });

  // Seed Variants
  const variant1 = await prisma.variant.create({
    data: {
      sku: "SMARTPHONE-X-BLACK",
      price: 699.99,
      stock: 50,
      productId: product1.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const variant2 = await prisma.variant.create({
    data: {
      sku: "TSHIRT-CLASSIC-M",
      price: 19.99,
      stock: 100,
      productId: product2.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Seed VariantOptions
  await prisma.variantOption.create({
    data: {
      attributeName: "Color",
      attributeValue: "Black",
      attributeStock: 25,
      variantId: variant1.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  await prisma.variantOption.create({
    data: {
      attributeName: "Size",
      attributeValue: "Medium",
      attributeStock: 50,
      variantId: variant2.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Seed Images
  await prisma.image.create({
    data: {
      url: "https://images.pexels.com/photos/325044/pexels-photo-325044.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      altText: "Smartphone X Black",
      isPrimary: true,
      productId: product1.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  await prisma.image.create({
    data: {
      url: "https://images.pexels.com/photos/325044/pexels-photo-325044.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      altText: "T-Shirt Classic Medium",
      isPrimary: true,
      productId: product2.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Seed Addresses
  const address1 = await prisma.address.create({
    data: {
      userId: user1.id,
      street: "123 Main St",
      city: "New York",
      country: "USA",
      postalCode: "10001",
      isDefault: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Seed Cart
  const cart1 = await prisma.cart.create({
    data: {
      userId: user1.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Seed CartItem
  await prisma.cartItem.create({
    data: {
      quantity: 2,
      cartId: cart1.id,
      productId: product1.id,
      variantId: variant1.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Seed Order
  const order1 = await prisma.order.create({
    data: {
      userId: user1.id,
      totalPrice: 1399.98, // 2 x Smartphone X
      status: OrderStatus.PENDING,
      shippingAddressId: address1.id,
      billingAddressId: address1.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Seed OrderItem
  await prisma.orderItem.create({
    data: {
      orderId: order1.id,
      productId: product1.id,
      variantId: variant1.id,
      quantity: 2,
      price: 699.99,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Seed Payment
  await prisma.payment.create({
    data: {
      orderId: order1.id,
      amount: 1399.98,
      paymentMethod: PaymentMethod.CREDIT_CARD,
      paymentStatus: PaymentStatus.PENDING,
      transactionId: "TXN123456",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Seed Review
  await prisma.review.create({
    data: {
      userId: user1.id,
      productId: product1.id,
      rating: 5,
      comment: "Amazing smartphone, highly recommend!",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    // process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

// import { PrismaClient } from "@prisma/client";
// const prisma = new PrismaClient();

// async function main() {
//   // Clear existing data (optional)
//   await prisma.image.deleteMany();
//   await prisma.variant.deleteMany();
//   await prisma.product.deleteMany();
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
//             altText: "img",
//           },
//           {
//             url: "https://images.unsplash.com/photo-1505852679233-d9fd70aff56d?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
//             altText: "img",
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
//           {
//             url: "https://example.com/images/tshirt-white-front.jpg",
//             altText: "image",
//           },
//           {
//             url: "https://example.com/images/tshirt-white-back.jpg",
//             altText: "image",
//           },
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
//     // process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
// // import { PrismaClient } from "@prisma/client";
// // const prisma = new PrismaClient();

// // async function main() {
// //   // Clear existing data (optional)
// //   await prisma.image.deleteMany();
// //   await prisma.variant.deleteMany();
// //   await prisma.product.deleteMany();
// //   await prisma.category.deleteMany();
// //   await prisma.user.deleteMany();

// //   // Create users
// //   await prisma.user.createMany({
// //     data: [
// //       {
// //         email: "admin@example.com",
// //         password: "$2b$10$ExampleHashedPassword", // In real app, hash properly
// //         role: "ADMIN",
// //         username: "admin",
// //       },
// //       {
// //         email: "staff@example.com",
// //         password: "$2b$10$ExampleHashedPassword",
// //         role: "EMPLOYER",
// //         username: "staff_member",
// //       },
// //       {
// //         email: "customer@example.com",
// //         password: "$2b$10$ExampleHashedPassword",
// //         role: "USER",
// //         username: "regular_customer",
// //       },
// //     ],
// //   });

// //   // Create categories
// //   const electronics = await prisma.category.create({
// //     data: {
// //       name: "Electronics",
// //     },
// //   });

// //   const audio = await prisma.category.create({
// //     data: {
// //       name: "Audio",
// //       parentId: electronics.id,
// //     },
// //   });

// //   const apparel = await prisma.category.create({
// //     data: {
// //       name: "Apparel",
// //     },
// //   });

// //   const tshirts = await prisma.category.create({
// //     data: {
// //       name: "T-Shirts",
// //       parentId: apparel.id,
// //     },
// //   });

// //   // Create tags
// //   const popularTag = await prisma.tag.create({
// //     data: {
// //       name: "popular",
// //     },
// //   });

// //   const newArrivalTag = await prisma.tag.create({
// //     data: {
// //       name: "new-arrival",
// //     },
// //   });

// //   // Create products
// //   const headphones = await prisma.product.create({
// //     data: {
// //       name: "Premium Wireless Headphones",
// //       sku: "AUD-WH-2024",
// //       description:
// //         "Noise-cancelling Bluetooth headphones with 30hr battery life",
// //       price: 199.99,
// //       stock: 45,
// //       status: "active",
// //       categoryId: audio.id,
// //       tags: {
// //         connect: [{ id: popularTag.id }, { id: newArrivalTag.id }],
// //       },
// //       variants: {
// //         create: [
// //           {
// //             color: "Black",
// //             stock: 25,
// //             sku: "AUD-WH-2024-BK",
// //             price: 199.99,
// //           },
// //           {
// //             color: "Silver",
// //             stock: 20,
// //             sku: "AUD-WH-2024-SL",
// //             price: 199.99,
// //           },
// //         ],
// //       },
// //       images: {
// //         create: [
// //           {
// //             url: "https://images.unsplash.com/photo-1505852679233-d9fd70aff56d?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
// //             altText: "img",
// //           },
// //           {
// //             url: "https://images.unsplash.com/photo-1505852679233-d9fd70aff56d?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
// //             altText: "img",
// //           },
// //         ],
// //       },
// //       stockHistory: {
// //         create: [
// //           { quantity: 50, reason: "initial-stock", location: "Warehouse A" },
// //           { quantity: -5, reason: "sale", location: "Warehouse A" },
// //         ],
// //       },
// //     },
// //   });

// //   const tshirt = await prisma.product.create({
// //     data: {
// //       name: "Organic Cotton T-Shirt",
// //       sku: "APP-TS-1002",
// //       description: "100% organic cotton unisex t-shirt",
// //       price: 29.99,
// //       stock: 82,
// //       status: "active",
// //       categoryId: tshirts.id,
// //       tags: {
// //         connect: { id: popularTag.id },
// //       },
// //       variants: {
// //         create: [
// //           {
// //             size: "S",
// //             stock: 20,
// //             sku: "APP-TS-1002-S",
// //             price: 29.99,
// //           },
// //           {
// //             size: "M",
// //             stock: 30,
// //             sku: "APP-TS-1002-M",
// //             price: 29.99,
// //           },
// //           {
// //             size: "L",
// //             stock: 32,
// //             sku: "APP-TS-1002-L",
// //             price: 29.99,
// //           },
// //         ],
// //       },
// //       images: {
// //         create: [
// //           {
// //             url: "https://example.com/images/tshirt-white-front.jpg",
// //             altText: "image",
// //           },
// //           {
// //             url: "https://example.com/images/tshirt-white-back.jpg",
// //             altText: "image",
// //           },
// //         ],
// //       },
// //       stockHistory: {
// //         create: [
// //           { quantity: 100, reason: "initial-stock", location: "Warehouse B" },
// //           { quantity: -18, reason: "sale", location: "Warehouse B" },
// //         ],
// //       },
// //     },
// //   });

// //   console.log("Database seeded successfully!");
// //   console.log({
// //     headphonesId: headphones.id,
// //     tshirtId: tshirt.id,
// //   });
// // }

// // main()
// //   .catch((e) => {
// //     console.error(e);
// //     process.exit(1);
// //   })
// //   .finally(async () => {
// //     await prisma.$disconnect();
// //   });
