import { Request, Response } from "express";
import prisma from "../config/database";
import { successResponse, errorResponse } from "../utils/response";

export const getPayments = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const userId = req.user?.id;
    if (!userId) return errorResponse(res, "Unauthorized", 401);

    const payments = await prisma.payment.findMany({
      where: { order: { userId } },
      include: {
        order: {
          select: {
            id: true,
            totalPrice: true,
            status: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return successResponse(res, payments, "Payments fetched successfully");
  } catch (error) {
    return errorResponse(res, "Failed to retrieve payments", 500, error);
  }
};

export const getPaymentById = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const userId = req.user?.id;
    if (!userId) return errorResponse(res, "Unauthorized", 401);

    const paymentId = req.params.id as string;

    const payment = await prisma.payment.findFirst({
      where: {
        id: paymentId,
        order: { userId },
      },
      include: {
        order: {
          include: {
            items: { include: { product: true, variant: true } },
            shippingAddress: true,
            billingAddress: true,
          },
        },
      },
    });

    if (!payment) return errorResponse(res, "Payment not found", 404);

    return successResponse(res, payment, "Payment fetched successfully");
  } catch (error) {
    return errorResponse(res, "Failed to retrieve payment", 500, error);
  }
};

export const updatePaymentStatus = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const paymentId = req.params.id as string;
    const { paymentStatus } = req.body;

    if (!paymentStatus)
      return errorResponse(res, "Payment status is required", 400);

    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: { paymentStatus },
      include: { order: true },
    });

    return successResponse(
      res,
      updatedPayment,
      "Payment status updated successfully"
    );
  } catch (error) {
    return errorResponse(res, "Failed to update payment status", 500, error);
  }
};

export const getPaymentByStripeIntent = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const userId = req.user?.id;
    if (!userId) return errorResponse(res, "Unauthorized", 401);

    const paymentIntentId = req.params.paymentIntentId as string;

    const payment = await prisma.payment.findFirst({
      where: {
        stripePaymentIntentId: paymentIntentId,
        order: { userId },
      },
      include: {
        order: {
          include: {
            items: { include: { product: true, variant: true } },
          },
        },
      },
    });

    if (!payment) return errorResponse(res, "Payment not found", 404);

    return successResponse(res, payment, "Payment fetched successfully");
  } catch (error) {
    return errorResponse(res, "Failed to retrieve payment", 500, error);
  }
};
