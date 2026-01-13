



// =========================================================
// 1. User & Authentication
// =========================================================

model User {
id          String      @id @default(cuid())
username    String      @unique
email       String      @unique
googleId    String?     @unique // for google 0auth
password    String?

role        Role        @default(USER)

firstName   String?
lastName    String?
phoneNumber String?
birthdate   DateTime?
bio         String?

avatarUrl   String?
verified    Boolean     @default(false)

createdAt   DateTime    @default(now())
updatedAt   DateTime    @updatedAt

// Add password hash for full auth or links for providers (e.g., NextAuth)

// Relationships
cart    Cart?     // One-to-one relationship with the user's current shopping cart
orders  Order[]   // One-to-many relationship with all placed orders

// addon shipping addresses
// pending for a while
// shippingAddresses shippingAddress[]

// add on 
emailVerificationTokens EmailVerificationToken[] // Add relation for email verify
passwordResetTokens PasswordResetToken[] // Add relation for password reset

@@map("users")
}
enum Role {
  USER
  EDITOR
  ADMIN
}

model PasswordResetToken {
  id        String   @id @default(uuid())
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  createdAt DateTime @default(now())
}

model EmailVerificationToken {
  id        String   @id @default(uuid())
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  createdAt DateTime @default(now())
}

// =========================================================
// 2. Product Catalog
// =========================================================

model Product {
id          String    @id @default(cuid())
name        String
description String?
price       Decimal   @db.Decimal(10, 2) // Use Decimal for precise currency representation
stock       Int
imageUrl    String?

createdAt   DateTime    @default(now())
updatedAt   DateTime    @updatedAt

// Relationships
cartItems   CartItem[]
orderItems  OrderItem[]



// @@map("products")
}

// =========================================================
// 3. Shopping Cart (Pre-Checkout)
// =========================================================

model Cart {
id        String     @id @default(cuid())

createdAt DateTime   @default(now())
updatedAt DateTime   @updatedAt

// Relationships
userId    String     @unique
user      User       @relation(fields: [userId], references: [id])

items     CartItem[] // Items currently in the cart


// @@map("carts")
}

model CartItem {
id          String   @id @default(cuid())
quantity    Int

createdAt   DateTime    @default(now())
updatedAt   DateTime    @updatedAt


// Relationships
cartId      String
cart        Cart     @relation(fields: [cartId], references: [id])
productId   String
product     Product  @relation(fields: [productId], references: [id])

// @@unique([cartId, productId]) // A user can only have one instance of a product in their cart
// @@map("cart_items")
}

// =========================================================
// 4. Order & Checkout (Post-Checkout)
// =========================================================


model Order {
id             String        @id @default(cuid())
userId         String
status         OrderStatus   @default(PENDING)
totalAmount    Decimal       @db.Decimal(10, 2)
shippingAddress Json?         // Store address details as a flexible JSON object

createdAt      DateTime      @default(now())
updatedAt      DateTime      @updatedAt

// Relationships
user           User          @relation(fields: [userId], references: [id])
items          OrderItem[]   // Snapshot of products at time of purchase

// // addOn shipping address relation
// shippingAddressId String @unique
// shipping   shippingAddress @relation(fields: [shippingAddressId], references: [id])

@@map("orders")
}


// model shippingAddress {
//   id          String @id @default(cuid())
//   street      String
//   state       String
//   city        String
//   country     String
//   postalCode  String
//   isDefault   Boolean @default(false)

//   createdAt   DateTime      @default(now())
//   updatedAt   DateTime      @updatedAt

//   // relationship
//   userId      String
//   user  User  @relation(fields: [userId], references: [id])

//   // orders shipped to this address
//   order Order[]
  
// }

model OrderItem {
id          String    @id @default(cuid())
productName String    // Snapshot of the name at the time of purchase
price       Decimal   @db.Decimal(10, 2) // The price at the time the order was placed (crucial for history)
quantity    Int

createdAt   DateTime    @default(now())
updatedAt   DateTime    @updatedAt


// Relationships
orderId     String
order       Order     @relation(fields: [orderId], references: [id])
// Optional link back to Product, but productName and price are mandatory for historical record
productId   String?   // Optional if product is deleted, but good for linking
product     Product?  @relation(fields: [productId], references: [id])


@@map("order_items")
}

enum OrderStatus {
  PENDING   // Order created, waiting for payment confirmation
  PAID      // Payment successful, processing
  SHIPPED   // Order has been shipped
  DELIVERED // Order has reached the customer
  CANCELLED // Order was cancelled
}



// Add this to your Prisma schema file (schema.prisma)
// Then run: npx prisma migrate dev --name add_webhook_events

model ProcessedWebhookEvent {
  id        String   @id // Stripe event ID
  createdAt DateTime @default(now())

  @@map("processed_webhook_events")
}

// **** BACKUP ****
// generator client {
// provider = "prisma-client-js"
// }

// datasource db {
// provider = "mysql"
// url      = env("DATABASE_URL")
// }

// // =========================================================
// // 1. User & Authentication
// // =========================================================

// model User {
// id        String @id @default(cuid())
// email     String @unique
// name      String?
// password  String
// googleId  String? @unique // for google 0auth
// // Add password hash for full auth or links for providers (e.g., NextAuth)

// // Relationships
// cart    Cart?     // One-to-one relationship with the user's current shopping cart
// orders  Order[]   // One-to-many relationship with all placed orders

// @@map("users")
// }

// // =========================================================
// // 2. Product Catalog
// // =========================================================

// model Product {
// id          String    @id @default(cuid())
// name        String
// description String?
// price       Decimal   @db.Decimal(10, 2) // Use Decimal for precise currency representation
// stock       Int
// imageUrl    String?

// // Relationships
// cartItems   CartItem[]
// orderItems  OrderItem[]

// // @@map("products")
// }

// // =========================================================
// // 3. Shopping Cart (Pre-Checkout)
// // =========================================================

// model Cart {
// id        String     @id @default(cuid())
// createdAt DateTime   @default(now())
// updatedAt DateTime   @updatedAt

// // Relationships
// userId    String     @unique
// user      User       @relation(fields: [userId], references: [id])

// items     CartItem[] // Items currently in the cart

// // @@map("carts")
// }

// model CartItem {
// id          String   @id @default(cuid())
// quantity    Int

// // Relationships
// cartId      String
// cart        Cart     @relation(fields: [cartId], references: [id])
// productId   String
// product     Product  @relation(fields: [productId], references: [id])

// // @@unique([cartId, productId]) // A user can only have one instance of a product in their cart
// // @@map("cart_items")
// }

// // =========================================================
// // 4. Order & Checkout (Post-Checkout)
// // =========================================================

// enum OrderStatus {
// PENDING   // Order created, waiting for payment confirmation
// PAID      // Payment successful, processing
// SHIPPED   // Order has been shipped
// DELIVERED // Order has reached the customer
// CANCELLED // Order was cancelled
// }

// model Order {
// id             String        @id @default(cuid())
// userId         String
// status         OrderStatus   @default(PENDING)
// totalAmount    Decimal       @db.Decimal(10, 2)
// shippingAddress Json?         // Store address details as a flexible JSON object

// createdAt      DateTime      @default(now())
// updatedAt      DateTime      @updatedAt

// // Relationships
// user           User          @relation(fields: [userId], references: [id])
// items          OrderItem[]   // Snapshot of products at time of purchase

// @@map("orders")
// }

// model OrderItem {
// id          String    @id @default(cuid())
// orderId     String
// productId   String?   // Optional if product is deleted, but good for linking
// productName String    // Snapshot of the name at the time of purchase
// price       Decimal   @db.Decimal(10, 2) // The price at the time the order was placed (crucial for history)
// quantity    Int

// // Relationships
// order       Order     @relation(fields: [orderId], references: [id])
// // Optional link back to Product, but productName and price are mandatory for historical record
// product     Product?  @relation(fields: [productId], references: [id])

// @@map("order_items")
// }

// // Add this to your Prisma schema file (schema.prisma)
// // Then run: npx prisma migrate dev --name add_webhook_events

// model ProcessedWebhookEvent {
//   id        String   @id // Stripe event ID
//   createdAt DateTime @default(now())

//   @@map("processed_webhook_events")
// }

// END HERE *******
// generator client {
//   provider = "prisma-client-js"
// }

// datasource db {
//   provider = "mysql"
//   url      = env("DATABASE_URL")
// }

// model User {
//   id            String         @id @default(uuid())
//   username      String         @unique
//   email         String         @unique
//   password      String
//   googleId      String?        @unique // Add for Google OAuth
//   role          Role           @default(USER)
//   isEmailVerified Boolean      @default(false)
//   carts         Cart[]
//   orders        Order[]
//   addresses     Address[]
//   reviews       Review[]
//   products      Product[]      // Added: Opposite relation for Product
//   emailVerificationTokens EmailVerificationToken[] // Add relation for email verify
//   passwordResetTokens PasswordResetToken[] // Add relation for password reset
//   createdAt     DateTime       @default(now())
//   updatedAt     DateTime       @updatedAt
// }

// model PasswordResetToken {
//   id        String   @id @default(uuid())
//   token     String   @unique
//   userId    String
//   user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
//   expiresAt DateTime
//   createdAt DateTime @default(now())
// }

// model EmailVerificationToken {
//   id        String   @id @default(uuid())
//   token     String   @unique
//   userId    String
//   user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
//   expiresAt DateTime
//   createdAt DateTime @default(now())
// }

// model Product {
//   id            String          @id @default(uuid())
//   title         String
//   description   String          @db.Text
//   variants      Variant[]
//   images        Image[]
//   cartItems     CartItem[]
//   orderItems    OrderItem[]
//   productBrands ProductBrands[]
//   reviews       Review[]
//   categoryId    String // at user input form generate with list if already create or create actjio0n there.
//   category      Category?       @relation(fields: [categoryId], references: [id])
//   userId        String
//   user          User            @relation(fields: [userId], references: [id])
//   createdAt     DateTime        @default(now())
//   updatedAt     DateTime        @updatedAt
//   @@index([title])
// }

// model ProductBrands {
//   id        String      @id @default(uuid())
//   brandId   String
//   brand     Brand       @relation(fields: [brandId], references: [id])
//   productId String
//   product   Product     @relation(fields: [productId], references: [id])
// }

// model Brand {
//   id         String          @id @default(uuid())
//   brandName  String          @unique
//   productBrand ProductBrands[]
//   createdAt DateTime  @default(now())
//   updatedAt DateTime  @updatedAt
// }

// // can get products data by categoryName
// model Category {
//   id           String       @id @default(uuid())
//   categoryName String       @unique
//   products     Product[]
//   createdAt DateTime  @default(now())
//   updatedAt DateTime  @updatedAt
// }

// model Variant {
//   id             String          @id @default(uuid())
//   sku            String          @unique
//   price          Decimal         @db.Decimal(10, 2)
//   discountPrice  Decimal?        @db.Decimal(10, 2)
//   stock          Int?
//   cartItems      CartItem[]
//   orderItems     OrderItem[]
//   productId      String
//   product        Product         @relation(fields: [productId], references: [id])
//   variantOptions VariantOption[]
//   createdAt      DateTime        @default(now())
//   updatedAt      DateTime        @updatedAt
//   @@index([sku])
// }

// model VariantOption {
//   id             String   @id @default(uuid())
//   attributeName  String
//   attributeValue String
//   attributeStock Int?
//   variantId      String
//   variant        Variant  @relation(fields: [variantId], references: [id])
//   createdAt      DateTime @default(now())
//   updatedAt      DateTime @updatedAt
// }

// model Image {
//   id        String   @id @default(uuid())
//   url       String
//   altText   String
//   isPrimary Boolean  @default(false)
//   productId String
//   product   Product  @relation(fields: [productId], references: [id])
//   createdAt DateTime @default(now())
//   updatedAt DateTime @updatedAt
// }

// model Cart {
//   id        String     @id @default(uuid())
//   items     CartItem[]
//   userId    String
//   user      User       @relation(fields: [userId], references: [id])
//   createdAt DateTime   @default(now())
//   updatedAt DateTime   @updatedAt
// }

// model CartItem {
//   id        String   @id @default(uuid())
//   quantity  Int
//   cartId    String
//   cart      Cart     @relation(fields: [cartId], references: [id])
//   productId String
//   product   Product  @relation(fields: [productId], references: [id])
//   variantId String
//   variant   Variant  @relation(fields: [variantId], references: [id])
//   createdAt DateTime @default(now())
//   updatedAt DateTime @updatedAt
// }

// model Order {
//   id                String           @id @default(uuid())
//   userId            String
//   totalPrice        Decimal          @db.Decimal(10, 2)
//   status            OrderStatus      @default(PENDING)
//   shippingAddressId String?
//   billingAddressId  String?
//   paymentId         String?          @unique // Ensure one-to-one relation
//   shippingAddress   Address?         @relation(fields: [shippingAddressId], references: [id], name: "ShippingAddress")
//   billingAddress    Address?         @relation(fields: [billingAddressId], references: [id], name: "BillingAddress")
//   payment           Payment?         @relation(fields: [paymentId], references: [id])
//   items             OrderItem[]
//   user              User             @relation(fields: [userId], references: [id])
//   createdAt         DateTime         @default(now())
//   updatedAt         DateTime         @updatedAt
// }

// model OrderItem {
//   id        String   @id @default(uuid())
//   orderId   String
//   productId String
//   variantId String
//   quantity  Int
//   price     Decimal  @db.Decimal(10, 2)
//   createdAt DateTime @default(now())
//   updatedAt DateTime @updatedAt
//   order     Order    @relation(fields: [orderId], references: [id])
//   product   Product  @relation(fields: [productId], references: [id])
//   variant   Variant  @relation(fields: [variantId], references: [id])
// }

// model Address {
//   id             String   @id @default(uuid())
//   userId         String
//   user           User     @relation(fields: [userId], references: [id])
//   street         String
//   city           String
//   state          String?
//   country        String
//   postalCode     String
//   isDefault      Boolean  @default(false)
//   createdAt      DateTime @default(now())
//   updatedAt      DateTime @updatedAt
//   ordersShipping Order[]  @relation("ShippingAddress")
//   ordersBilling  Order[]  @relation("BillingAddress")
// }

// model Review {
//   id        String   @id @default(uuid())
//   userId    String
//   productId String
//   rating    Int      @db.TinyInt
//   comment   String?  @db.Text
//   createdAt DateTime @default(now())
//   updatedAt DateTime @updatedAt
//   user      User     @relation(fields: [userId], references: [id])
//   product   Product  @relation(fields: [productId], references: [id])
// }

// model Payment {
//   id             String        @id @default(uuid())
//   orderId        String        @unique
//   amount         Decimal       @db.Decimal(10, 2)
//   paymentMethod  PaymentMethod
//   paymentStatus  PaymentStatus @default(PENDING)
//   transactionId  String?
//   createdAt      DateTime      @default(now())
//   updatedAt      DateTime      @updatedAt
//   order          Order?        @relation() // Removed fields and references
// }

// enum Role {
//   ADMIN
//   USER
//   EMPLOYER
// }

// enum PaymentMethod {
//   CREDIT_CARD
//   DEBIT_CARD
//   PAYPAL
//   BANK_TRANSFER
//   CASH_ON_DELIVERY
// }

// enum PaymentStatus {
//   PENDING
//   COMPLETED
//   FAILED
//   REFUNDED
// }

// enum OrderStatus {
//   PENDING
//   PROCESSING
//   SHIPPED
//   DELIVERED
//   CANCELLED
//   RETURNED
// }
