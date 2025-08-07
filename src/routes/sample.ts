import { Request, Response } from "express";
import { prisma } from "../path/to/your/prisma/client"; // Adjust the import path for your prisma client
import { OrderStatus, PaymentMethod, PaymentStatus } from "@prisma/client"; // Import enums

// The existing functions (addToCart, getCart, etc.) would be here...

/**
 * @description Processes the user's cart to create an order.
 * @route POST /api/checkout
 * @access Private
 */
export const checkout = async (
  req: Request,
  res: Response
): Promise<Response> => {
  // 1. Authenticate the user
  const userId = req.user?.id;
  if (!userId) {
    return res
      .status(401)
      .json({ error: "Unauthorized: User not authenticated." });
  }

  // 2. Validate input from the request body
  const {
    shippingAddressId,
    billingAddressId,
    paymentMethod,
  }: {
    shippingAddressId: string;
    billingAddressId: string;
    paymentMethod: PaymentMethod; // Use the enum for type safety
  } = req.body;

  if (!shippingAddressId || !billingAddressId || !paymentMethod) {
    return res.status(400).json({
      error:
        "Missing required fields: shippingAddressId, billingAddressId, and paymentMethod are required.",
    });
  }

  try {
    // 3. Use a Prisma transaction to ensure all-or-nothing database operations
    const newOrder = await prisma.$transaction(async (tx) => {
      // a. Retrieve all cart items for the user
      const cartItems = await tx.cartItem.findMany({
        where: { cart: { userId } },
        include: {
          variant: true, // Include variant to check price and stock
        },
      });

      if (cartItems.length === 0) {
        throw new Error("Cannot checkout: Your cart is empty.");
      }

      // b. Verify addresses belong to the user
      const addresses = await tx.address.findMany({
        where: { id: { in: [shippingAddressId, billingAddressId] }, userId },
      });

      if (addresses.length < 2 && shippingAddressId !== billingAddressId) {
        throw new Error("Invalid shipping or billing address provided.");
      }
      if (
        !addresses.some((addr) => addr.id === shippingAddressId) ||
        !addresses.some((addr) => addr.id === billingAddressId)
      ) {
        throw new Error("One or more addresses do not belong to the user.");
      }

      let totalPrice = 0;
      const orderItemsData = [];

      // c. Check stock for each item and calculate total price
      for (const item of cartItems) {
        if (!item.variant) {
          throw new Error(
            `Product variant for item ${item.productId} not found.`
          );
        }
        if (item.variant.stock === null || item.variant.stock < item.quantity) {
          throw new Error(`Not enough stock for product: ${item.variant.sku}.`);
        }

        const itemPrice = item.variant.discountPrice ?? item.variant.price;
        totalPrice += Number(itemPrice) * item.quantity;

        // Prepare data for creating OrderItems
        orderItemsData.push({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          price: itemPrice,
        });
      }

      // d. Create the Order and its associated OrderItems
      const order = await tx.order.create({
        data: {
          userId,
          totalPrice,
          shippingAddressId,
          billingAddressId,
          status: OrderStatus.PENDING,
          items: {
            create: orderItemsData,
          },
        },
      });

      // e. Create the corresponding Payment record
      await tx.payment.create({
        data: {
          orderId: order.id,
          amount: totalPrice,
          paymentMethod,
          paymentStatus: PaymentStatus.PENDING, // Payment is pending until confirmed
        },
      });

      // f. Decrement stock for each variant
      for (const item of cartItems) {
        await tx.variant.update({
          where: { id: item.variantId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      // g. Clear the user's cart
      const userCart = await tx.cart.findUnique({ where: { userId } });
      if (userCart) {
        await tx.cartItem.deleteMany({
          where: { cartId: userCart.id },
        });
      }

      // The transaction will return the newly created order
      return order;
    });

    // 4. Send a success response
    return res.status(201).json({
      success: true,
      message: "Order placed successfully!",
      order: newOrder,
    });
  } catch (error: any) {
    // 5. Handle any errors that occurred during the transaction
    console.error("Checkout error:", error);
    // Send specific error messages to the client
    if (
      error.message.includes("Not enough stock") ||
      error.message.includes("Your cart is empty") ||
      error.message.includes("Invalid address")
    ) {
      return res.status(400).json({ error: error.message });
    }
    // Generic server error for other issues
    return res
      .status(500)
      .json({ error: "An internal server error occurred during checkout." });
  }
};
