import { Request, Response } from "express";
import prisma from "../config/database";
import { successResponse, errorResponse } from "../utils/response";

export const getOrders = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    if (!userId) return errorResponse(res, "Unauthorized", 401);

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                images: {
                  where: { isPrimary: true },
                  take: 1,
                },
              },
            },
            variant: {
              select: {
                color: true,
                size: true,
                price: true,
              },
            },
          },
        },
        shippingAddress: true,
        billingAddress: true,
        payment: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return successResponse(res, orders, "Orders fetched successfully");
  } catch (error) {
    return errorResponse(res, "Failed to fetch orders", 500, error);
  }
};

export const getOrderById = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const userId = req.user?.id;
    if (!userId) return errorResponse(res, "Unauthorized", 401);

    const orderId = req.params.id as string;

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId },
      include: {
        items: {
          include: {
            product: { include: { images: true } },
            variant: true,
          },
        },
        shippingAddress: true,
        billingAddress: true,
        payment: true,
      },
    });

    if (!order) return errorResponse(res, "Order not found", 404);

    return successResponse(res, order, "Order fetched successfully");
  } catch (error) {
    return errorResponse(res, "Failed to fetch order", 500, error);
  }
};

export const updateOrderStatus = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const userId = req.user?.id;
    if (!userId) return errorResponse(res, "Unauthorized", 401);

    const orderId = req.params.id as string;
    const { status } = req.body;

    if (!status) return errorResponse(res, "Status is required", 400);

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId },
    });

    if (!order)
      return errorResponse(res, "Order not found or access denied", 404);

    const isAdmin = req.user?.role === "ADMIN";
    if (!isAdmin && status !== "CANCELLED") {
      return errorResponse(
        res,
        "Users can only cancel orders. Other updates require admin access.",
        403
      );
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        items: { include: { product: true, variant: true } },
        payment: true,
      },
    });

    return successResponse(
      res,
      updatedOrder,
      "Order status updated successfully"
    );
  } catch (error) {
    return errorResponse(res, "Failed to update order status", 500, error);
  }
};

export const getOrderStats = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const userId = req.user?.id;
    if (!userId) return errorResponse(res, "Unauthorized", 401);

    const [totalOrders, totalSpent, pendingOrders, completedOrders] =
      await Promise.all([
        prisma.order.count({ where: { userId } }),
        prisma.order.aggregate({
          where: { userId },
          _sum: { totalPrice: true },
        }),
        prisma.order.count({ where: { userId, status: "PROCESSING" } }),
        prisma.order.count({ where: { userId, status: "DELIVERED" } }),
      ]);

    return successResponse(
      res,
      {
        totalOrders,
        totalSpent: totalSpent._sum.totalPrice || 0,
        pendingOrders,
        completedOrders,
      },
      "Order statistics fetched successfully"
    );
  } catch (error) {
    return errorResponse(res, "Failed to fetch order statistics", 500, error);
  }
};
