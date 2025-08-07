import { Request, Response } from "express";
import prisma from "../config/database";

const order = async (req: Request, res: Response): Promise<any> => {
  const userId = req.user?.id;

  const { orderId, productId, variantId, quantity, price } = req.body;

  try {
    const orderItem = await prisma.orderItem.create({
      data: {
        orderId,
        productId,
        variantId,
        quantity,
        price,
      },
    });
    console.log(orderItem, " check OrderItem");
    res.status(200).json(orderItem);
  } catch (error) {
    return res.status(500).json({ error: "Order failed" });
  }
};

const checkout = async (req: Request, res: Response): Promise<any> => {
  const userId = req.user?.id;
  const { shippingAddressId, billingAddressId, paymentMethod } = req.body;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // 1. Fetch user's cart with items + variant info
    const cart = await prisma.cart.findFirst({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    // 2. Calculate total
    let totalPrice = 0;
    for (const item of cart.items) {
      const price = Number(item.variant.discountPrice ?? item.variant.price);
      totalPrice += price * item.quantity;
    }

    // 3. Create order
    const order = await prisma.order.create({
      data: {
        userId,
        totalPrice,
        shippingAddressId,
        billingAddressId,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.variant.discountPrice ?? item.variant.price,
          })),
        },
      },
    });

    // 4. Create payment
    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: totalPrice,
        paymentMethod,
        paymentStatus: "PENDING", // Change to COMPLETED after verification
      },
    });

    // 5. Attach payment to order (optional due to relation)
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentId: payment.id },
    });

    // 6. Clear cart
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return res.status(201).json({
      success: true,
      message: "Checkout completed",
      order,
      payment,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Checkout failed" });
  }
};

export { order, checkout };

// import { Request, Response } from "express";
// import prisma from "../config/database";
// import { OrderStatus, PaymentMethod, PaymentStatus } from "@prisma/client"; // Import enums

// console.log(OrderStatus, PaymentStatus, PaymentMethod, " status enum");

// /**
//  * @description Processes the user's cart to create an order.
//  * @route POST /api/checkout
//  * @access Private
//  */

// const checkout = async (req: Request, res: Response): Promise<any> => {
//   const { productId, variantId, totalQuantity, totalPrice } = req.body;

//   // 1. Authenticate the user
//   const userId = req.user?.id;
//   if (!userId) {
//     return res
//       .status(401)
//       .json({ error: "Unauthorized: User not authenticated." });
//   }

//   // 2. Validate input from the request body
//   const {
//     shippingAddressId,
//     billingAddressId,
//     paymentMethod,
//   }: {
//     shippingAddressId: string;
//     billingAddressId: string;
//     paymentMethod: PaymentMethod; // Use the enum for type safety
//   } = req.body;

//   if (!shippingAddressId || !billingAddressId || !paymentMethod) {
//     return res.status(400).json({
//       error:
//         "Missing required fields: shippingAddressId, billingAddressId, and paymentMethod are required.",
//     });
//   }

//   try {
//     // 3. Use a Prisma transaction to ensure all-or-nothing database operations
//     const newOrder = await prisma.$transaction(async (tx) => {
//       // a. Retrieve all cart items for the user
//       const cartItems = await tx.cartItem.findMany({
//         where: { cart: { userId } },
//         include: {
//           variant: true, // Include variant to check price and stock
//         },
//       });

//       if (cartItems.length === 0) {
//         throw new Error("Cannot checkout: Your cart is empty.");
//       }
//       console.log("cartItem check pass");

//       // b. Verify addresses belong to the user
//       const addresses = await tx.address.findMany({
//         where: { id: { in: [shippingAddressId, billingAddressId] }, userId },
//       });

//       if (addresses.length < 2 && shippingAddressId !== billingAddressId) {
//         throw new Error("Invalid shipping or billing address provided.");
//       }
//       if (
//         !addresses.some((addr) => addr.id === shippingAddressId) ||
//         !addresses.some((addr) => addr.id === billingAddressId)
//       ) {
//         throw new Error("One or more addresses do not belong to the user.");
//       }

//       let totalPrice = 0;
//       const orderItemsData = [];
//     });
//     // 4. Send a success response
//     return res.status(201).json({
//       success: true,
//       message: "Order placed successfully!",
//       order: newOrder,
//     });
//   } catch (error) {
//     console.error(error);
//   }
// };

// export { checkout };

// // app.post("/cart/checkout", async (req, res) => {
// //   const { itemIds } = req.body;
// //   console.log(req.body, "finally chckout button req.body");
// //   try {
// //     // Fetch cart items and their details
// //     const cartItems = await prisma.cartItem.findMany({
// //       where: { id: { in: itemIds } },
// //       include: { product: true },
// //     });

// //     // Create an order with the fetched cart items
// //     const orderItems = cartItems.map((item) => ({
// //       productId: item.productId,
// //       quantity: item.quantity,
// //       price: item.product.price,
// //     }));

// //     const order = await prisma.order.create({
// //       data: {
// //         items: { createMany: { data: orderItems } },
// //       },
// //     });

// //     // Clear the cart after checkout (optional)
// //     await prisma.cartItem.deleteMany({ where: { id: { in: itemIds } } });
// //     console.log(order, "response for  checkout");
// //     res.json(order);
// //   } catch (error) {
// //     console.error(error);
// //     res.status(500).json({ error: "An error occurred during checkout." });
// //   }
// // });
