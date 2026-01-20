import { Request, Response } from "express";
import prisma from "../config/database";
import stripe from "../config/stripe";
import { Decimal } from "@prisma/client/runtime/library";
import { STRIPE_PUBLISHABLE_KEY } from "../utils/secrets";
import { successResponse, errorResponse } from "../utils/response";

// Create Stripe PaymentIntent
export const createPaymentIntent = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const userId = req.user?.id;
    if (!userId) return errorResponse(res, "Unauthorized", 401);

    let { shippingAddressId, billingAddressId } = req.body;

    const cartItems = await prisma.cartItem.findMany({
      where: { cart: { userId } },
      include: {
        product: true,
        variant: true,
      },
    });

    if (!cartItems || cartItems.length === 0) {
      return errorResponse(res, "Cart is empty", 400);
    }

    // Stock check
    for (const item of cartItems) {
      if (item.variant.stock !== null && item.variant.stock < item.quantity) {
        return errorResponse(
          res,
          `Insufficient stock for ${item.product.title}`,
          400,
        );
      }
    }

    let totalAmount = 0;
    cartItems.forEach((item) => {
      totalAmount += Number(item.variant.price) * item.quantity;
    });

    const amountInCents = Math.round(totalAmount * 100);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return errorResponse(res, "User not found", 404);

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId },
      });
      customerId = customer.id;
      await prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customerId },
      });
    }

    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customerId },
      { apiVersion: "2024-12-18.acacia" },
    );

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      customer: customerId,
      metadata: {
        userId,
        cartItemIds: cartItems.map((item) => item.id).join(","),
        shippingAddressId: shippingAddressId || "",
        billingAddressId: billingAddressId || "",
      },
      automatic_payment_methods: { enabled: true },
    });

    return successResponse(res, {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      customer: customerId,
      ephemeralKey: ephemeralKey.secret,
      amount: totalAmount,
    });
  } catch (error) {
    console.error("Stripe Error:", error);
    return errorResponse(res, "Failed to create payment intent", 500, error);
  }
};

// Confirm payment and create order
export const confirmPayment = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const userId = req.user?.id;
    if (!userId) return errorResponse(res, "Unauthorized", 401);

    const {
      paymentIntentId,
      shippingAddressId: reqShippingId,
      billingAddressId: reqBillingId,
    } = req.body;
    if (!paymentIntentId)
      return errorResponse(res, "Payment Intent ID is required", 400);

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== "succeeded") {
      return errorResponse(
        res,
        `Payment not successful: ${paymentIntent.status}`,
        400,
      );
    }

    // Check for existing order
    const existingPayment = await prisma.payment.findUnique({
      where: { stripePaymentIntentId: paymentIntentId },
    });

    if (existingPayment) {
      const order = await prisma.order.findUnique({
        where: { id: existingPayment.orderId },
        include: { items: true },
      });
      return successResponse(res, order, "Order already processed");
    }

    const {
      cartItemIds,
      shippingAddressId: metaShippingId,
      billingAddressId: metaBillingId,
    } = paymentIntent.metadata;

    // Prioritize request body address, fall back to metadata, potentially empty string means undefined for Prisma if handled poorly
    const shippingAddressId =
      reqShippingId || (metaShippingId !== "" ? metaShippingId : undefined);
    const billingAddressId =
      reqBillingId || (metaBillingId !== "" ? metaBillingId : undefined);

    const ids = cartItemIds.split(",");

    const cartItems = await prisma.cartItem.findMany({
      where: { id: { in: ids }, cart: { userId } },
      include: { variant: true },
    });

    if (cartItems.length === 0)
      return errorResponse(res, "Cart items not found", 400);

    let totalPrice = 0;
    cartItems.forEach((item) => {
      totalPrice += Number(item.variant.price) * item.quantity;
    });

    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId,
          totalPrice: new Decimal(totalPrice),
          status: "PROCESSING",
          shippingAddressId,
          billingAddressId,
          items: {
            create: cartItems.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              quantity: item.quantity,
              price: item.variant.price,
            })),
          },
        },
      });

      await tx.payment.create({
        data: {
          orderId: order.id,
          amount: new Decimal(totalPrice),
          currency: paymentIntent.currency,
          paymentMethod: "STRIPE",
          paymentStatus: "COMPLETED",
          stripePaymentIntentId: paymentIntentId,
          transactionId: paymentIntent.id,
        },
      });

      // Stock decrement
      for (const item of cartItems) {
        if (item.variant.stock !== null) {
          await tx.variant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }

      // Clear cart
      await tx.cartItem.deleteMany({ where: { id: { in: ids } } });

      return order;
    });

    return successResponse(res, result, "Order confirmed successfully", 201);
  } catch (error) {
    return errorResponse(res, "Failed to confirm payment", 500, error);
  }
};

export const getStripeConfig = (req: Request, res: Response): any => {
  return successResponse(res, { publishableKey: STRIPE_PUBLISHABLE_KEY });
};

export const handleWebhook = async (
  req: Request,
  res: Response,
): Promise<any> => {
  // Webhook implementation depends on Stripe signing secret which might not be set in dev
  // Standard boilerplate for now
  return successResponse(res, { received: true });
};
