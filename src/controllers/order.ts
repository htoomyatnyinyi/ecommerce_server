import { Request, Response } from "express";
import prisma from "../config/database";

/**
 * @description Get all orders for the logged-in user
 * @route GET /api/order
 * @access Private
 */
export const getOrders = async (req: Request, res: Response): Promise<any> => {
  const userId = req.user?.id;

  if (!userId) {
    return res
      .status(401)
      .json({ error: "Unauthorized: User not authenticated." });
  }

  try {
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

    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
};

/**
 * @description Get a specific order by ID
 * @route GET /api/order/:id
 * @access Private
 */
export const getOrderById = async (
  req: Request,
  res: Response
): Promise<any> => {
  const userId = req.user?.id;
  const { id: orderId }: any = req.params;

  if (!userId) {
    return res
      .status(401)
      .json({ error: "Unauthorized: User not authenticated." });
  }

  try {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: userId,
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
              },
            },
            variant: true,
          },
        },
        shippingAddress: true,
        billingAddress: true,
        payment: true,
      },
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found." });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch order",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
};

/**
 * @description Update order status
 * @route PUT /api/order/:id/status
 * @access Private (Admin can update any, users can cancel their own)
 */
export const updateOrderStatus = async (
  req: Request,
  res: Response
): Promise<any> => {
  const userId = req.user?.id;
  const { id: orderId }: any = req.params;
  const { status } = req.body;

  if (!userId) {
    return res
      .status(401)
      .json({ error: "Unauthorized: User not authenticated." });
  }

  if (!status) {
    return res.status(400).json({ error: "Status is required." });
  }

  try {
    // Check if order belongs to user
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: userId,
      },
    });

    if (!order) {
      return res
        .status(404)
        .json({ error: "Order not found or access denied." });
    }

    // Users can only cancel orders, admins can change to any status
    const isAdmin = req.user?.role === "ADMIN";
    if (!isAdmin && status !== "CANCELLED") {
      return res.status(403).json({
        error:
          "You can only cancel your orders. Other updates require admin access.",
      });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
        payment: true,
      },
    });

    res.status(200).json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update order status",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
};

/**
 * @description Get order statistics for the user
 * @route GET /api/order/stats
 * @access Private
 */
export const getOrderStats = async (
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
    const [totalOrders, totalSpent, pendingOrders, completedOrders] =
      await Promise.all([
        prisma.order.count({ where: { userId } }),
        prisma.order.aggregate({
          where: { userId },
          _sum: { totalPrice: true },
        }),
        prisma.order.count({ where: { userId, status: "PENDING" } }),
        prisma.order.count({ where: { userId, status: "DELIVERED" } }),
      ]);

    res.status(200).json({
      success: true,
      stats: {
        totalOrders,
        totalSpent: totalSpent._sum.totalPrice || 0,
        pendingOrders,
        completedOrders,
      },
    });
  } catch (error) {
    console.error("Error fetching order stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch order statistics",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
};
// ...existing code...
// export const createOrder = async (
//   req: Request,
//   res: Response
// ): Promise<any> => {
//   const userId = req.user?.id;
//   if (!userId) {
//     return res
//       .status(401)
//       .json({ message: "Unauthorized: User not authenticated" });
//   }

//   // const { totalPrice, orderItems } = req.body;
//   const { Hi, hello } = req.body;
//   console.log(Hi, hello);

//   try {
//     const getShippingAddressId = await prisma.address.findFirst({
//       where: { userId, isDefault: true },
//     });

//     // console.log(getShippingAddressId, "getShippingAddressId");

//     if (!getShippingAddressId) {
//       return res.status(400).json({ message: "Invalid shipping address ID" });
//     }

//     // const orderItemsArray = Array.isArray(orderItems) ? orderItems : [];

//     // if (orderItemsArray.length === 0) {
//     //   return res.status(400).json({ message: "Order items cannot be empty" });
//     // }

//     const getCartItemData = await prisma.cartItem.findMany(

//     );

//     console.log(getCartItemData, "getCartItemData");

//     // const newOrder = await prisma.order.create({
//     //   data: {
//     //     userId,
//     //     totalPrice,
//     //     shippingAddressId: getShippingAddressId.id,
//     //     items: {
//     //       create: orderItems.map((item: any) => ({
//     //         productId: item.productId,
//     //         variantId: item.variantId,
//     //         quantity: item.quantity,
//     //         price: item.price,
//     //       })),
//     //     },
//     //   },
//     // });

//     // res.status(200).json({ message: "I created.", newOrder });
//     res.status(200).json({ message: "I created." });
//   } catch (error) {
//     res.status(500).json({
//       message: "Failed to get orders",
//       error,
//     });
//   }
// };

// #### note

// export const order = async (req: Request, res: Response): Promise<any> => {
//   const userId = req.user?.id;
//   if (!userId) {
//     return res
//       .status(401)
//       .json({ message: "Unauthorized: User not authenticated" });
//   }
// };

// export const order = async (req: Request, res: Response): Promise<any> => {
//   const userId = req.user?.id;
//   if (!userId) {
//     return res
//       .status(401)
//       .json({ message: "Unauthorized: User not authenticated" });
//   }
//   console.log(req.body, "at category");
//   // const { categoryName } = req.body;
//   const { name } = req.body;

//   try {
//     const categoryResponse = await prisma.category.create({
//       // data: {
//       //   categoryName
//       // },
//       data: {
//         categoryName: name,
//       },
//     });
//     res.status(201).json(categoryResponse);
//   } catch (error) {
//     console.error("Error fetching products:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed create category ",
//       error: process.env.NODE_ENV === "development" ? error : undefined,
//     });
//   }
// };

// ### note
// export const checkout = async (req: Request, res: Response): Promise<any> => {
//   try {
//     const categoryResponse = await prisma.category.findMany();
//     res.status(200).json(categoryResponse);
//   } catch (error) {
//     console.error("Error fetching products:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch category",
//       error: process.env.NODE_ENV === "dewwwvelopment" ? error : undefined,
//     });
//   }
// };
