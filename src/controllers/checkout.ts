import { Request, Response } from "express";
import Stripe from "stripe";
import prisma from "../config/database";
import stripe from "../config/stripe";
import {
  CreatePaymentIntentRequest,
  ConfirmPaymentRequest,
} from "../types/stripe";
import { Decimal } from "@prisma/client/runtime/library";

/**
 * @description Create a Stripe PaymentIntent for checkout
 * @route POST /api/checkout/create-payment-intent
 * @access Private
 */
export const createPaymentIntent = async (
  req: Request,
  res: Response
): Promise<any> => {
  const userId = req.user?.id;

  if (!userId) {
    return res
      .status(401)
      .json({ error: "Unauthorized: User not authenticated." });
  }

  try {
    const { shippingAddressId, billingAddressId } = req.body;

    // Get user's cart items
    const cartItems = await prisma.cartItem.findMany({
      where: { cart: { userId } },
      include: {
        product: {
          select: {
            id: true,
            title: true,
          },
        },
        variant: {
          select: {
            id: true,
            price: true,
            stock: true,
            sku: true,
          },
        },
      },
    });

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ error: "Cart is empty." });
    }

    // Check stock availability
    for (const item of cartItems) {
      if (item.variant.stock !== null && item.variant.stock < item.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for ${item.product.title}. Available: ${item.variant.stock}, Requested: ${item.quantity}`,
        });
      }
    }

    // Calculate total amount
    let totalAmount = 0;
    cartItems.forEach((item) => {
      const price = Number(item.variant.price);
      totalAmount += price * item.quantity;
    });

    // Convert to cents for Stripe
    const amountInCents = Math.round(totalAmount * 100);

    // Get or create Stripe customer
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    let customerId = user.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user.id,
        },
      });

      customerId = customer.id;

      // Save Stripe customer ID to user
      await prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customerId },
      });
    }

    // Create PaymentIntent
    // Stripe metadata requires all values to be strings
    const metadata: Record<string, string> = {
      userId,
      cartItemIds: cartItems.map((item) => item.id).join(","),
    };

    if (shippingAddressId) metadata.shippingAddressId = shippingAddressId;
    if (billingAddressId) metadata.billingAddressId = billingAddressId;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      customer: customerId,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
      description: `Order for ${user.email}`,
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: totalAmount,
      cartItems: cartItems.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        title: item.product.title,
        quantity: item.quantity,
        price: Number(item.variant.price),
      })),
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    res.status(500).json({
      error: "Failed to create payment intent.",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * @description Confirm payment and create order
 * @route POST /api/checkout/confirm-payment
 * @access Private
 */
export const confirmPayment = async (
  req: Request,
  res: Response
): Promise<any> => {
  const userId = req.user?.id;

  if (!userId) {
    return res
      .status(401)
      .json({ error: "Unauthorized: User not authenticated." });
  }

  try {
    const { paymentIntentId, shippingAddressId, billingAddressId } =
      req.body as ConfirmPaymentRequest;

    if (!paymentIntentId) {
      return res.status(400).json({ error: "Payment Intent ID is required." });
    }

    // Retrieve PaymentIntent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== "succeeded") {
      return res.status(400).json({
        error: "Payment not successful.",
        status: paymentIntent.status,
      });
    }

    // Check if order already exists for this payment intent
    const existingPayment = await prisma.payment.findUnique({
      where: { stripePaymentIntentId: paymentIntentId },
    });

    if (existingPayment) {
      const existingOrder = await prisma.order.findUnique({
        where: { id: existingPayment.orderId },
        include: {
          items: true,
          payment: true,
        },
      });

      return res.status(200).json({
        success: true,
        message: "Order already exists for this payment.",
        order: existingOrder,
      });
    }

    // Get cart items
    const metadata = paymentIntent.metadata as Record<string, string>;
    const cartItemIds = metadata.cartItemIds?.split(",") || [];

    const cartItems = await prisma.cartItem.findMany({
      where: {
        id: { in: cartItemIds },
        cart: { userId },
      },
      include: {
        product: true,
        variant: true,
      },
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ error: "Cart items not found." });
    }

    // Calculate total
    let totalPrice = 0;
    cartItems.forEach((item) => {
      totalPrice += Number(item.variant.price) * item.quantity;
    });

    // Create order with payment in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create order
      const order = await tx.order.create({
        data: {
          userId,
          totalPrice: new Decimal(totalPrice),
          status: "PROCESSING",
          shippingAddressId: shippingAddressId || metadata.shippingAddressId,
          billingAddressId: billingAddressId || metadata.billingAddressId,
          items: {
            create: cartItems.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              quantity: item.quantity,
              price: item.variant.price,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: true,
              variant: true,
            },
          },
        },
      });

      // Create payment record
      // Get receipt URL if charge exists
      let receiptUrl: string | null = null;
      if (typeof paymentIntent.latest_charge === "string") {
        try {
          const charge = await stripe.charges.retrieve(
            paymentIntent.latest_charge
          );
          receiptUrl = charge.receipt_url;
        } catch (error) {
          console.error("Error retrieving charge receipt:", error);
        }
      }

      const payment = await tx.payment.create({
        data: {
          orderId: order.id,
          amount: new Decimal(totalPrice),
          currency: paymentIntent.currency,
          paymentMethod: "STRIPE",
          paymentStatus: "COMPLETED",
          stripePaymentIntentId: paymentIntentId,
          transactionId: paymentIntent.id,
          metadata: {
            chargeId:
              typeof paymentIntent.latest_charge === "string"
                ? paymentIntent.latest_charge
                : null,
            receiptUrl,
          },
        },
      });

      // Update stock for variants
      for (const item of cartItems) {
        if (item.variant.stock !== null) {
          await tx.variant.update({
            where: { id: item.variantId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
        }
      }

      // Clear cart items
      await tx.cartItem.deleteMany({
        where: {
          id: { in: cartItemIds },
        },
      });

      return { order, payment };
    });

    res.status(201).json({
      success: true,
      message: "Order created successfully.",
      order: result.order,
      payment: result.payment,
    });
  } catch (error) {
    console.error("Error confirming payment:", error);
    res.status(500).json({
      error: "Failed to confirm payment and create order.",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * @description Handle Stripe webhook events
 * @route POST /api/checkout/webhook
 * @access Public (Stripe webhook)
 */
export const handleWebhook = async (
  req: Request,
  res: Response
): Promise<any> => {
  const sig = req.headers["stripe-signature"];

  if (!sig) {
    return res.status(400).json({ error: "Missing stripe signature" });
  }

  let event: Stripe.Event;

  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error("Webhook secret not configured");
    }

    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return res.status(400).json({
      error: `Webhook Error: ${
        err instanceof Error ? err.message : "Unknown error"
      }`,
    });
  }

  // Handle the event
  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`PaymentIntent succeeded: ${paymentIntent.id}`);

        // Update payment status if exists
        await prisma.payment.updateMany({
          where: { stripePaymentIntentId: paymentIntent.id },
          data: { paymentStatus: "COMPLETED" },
        });
        break;

      case "payment_intent.payment_failed":
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        console.log(`PaymentIntent failed: ${failedPayment.id}`);

        await prisma.payment.updateMany({
          where: { stripePaymentIntentId: failedPayment.id },
          data: { paymentStatus: "FAILED" },
        });
        break;

      case "charge.refunded":
        const refund = event.data.object as Stripe.Charge;
        console.log(`Charge refunded: ${refund.id}`);

        if (
          refund.payment_intent &&
          typeof refund.payment_intent === "string"
        ) {
          await prisma.payment.updateMany({
            where: { stripePaymentIntentId: refund.payment_intent },
            data: {
              paymentStatus: "REFUNDED",
              stripeRefundId: refund.refunds?.data[0]?.id,
            },
          });
        }
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Error handling webhook:", error);
    res.status(500).json({ error: "Webhook handler failed" });
  }
};

/**
 * @description Get Stripe publishable key
 * @route GET /api/checkout/config
 * @access Public
 */
export const getStripeConfig = async (
  req: Request,
  res: Response
): Promise<any> => {
  res.status(200).json({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  });
};

/**
 * @description Cancel a payment intent
 * @route POST /api/checkout/cancel-payment
 * @access Private
 */
export const cancelPaymentIntent = async (
  req: Request,
  res: Response
): Promise<any> => {
  const userId = req.user?.id;

  if (!userId) {
    return res
      .status(401)
      .json({ error: "Unauthorized: User not authenticated." });
  }

  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ error: "Payment Intent ID is required." });
    }

    const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);

    res.status(200).json({
      success: true,
      message: "Payment intent cancelled.",
      status: paymentIntent.status,
    });
  } catch (error) {
    console.error("Error cancelling payment intent:", error);
    res.status(500).json({
      error: "Failed to cancel payment intent.",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
