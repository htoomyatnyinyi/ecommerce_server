import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "../../config/database";
import { JWT_SECRET, NODE_ENV } from "../../utils/secrets";
import bcrypt from "bcrypt";
import { createAccountType } from "../../types/adminTypes";
import { successResponse, errorResponse } from "../../utils/response";

const createAccount = async (
  req: Request<{}, {}, createAccountType>,
  res: Response
): Promise<any> => {
  try {
    const { username, email, password, confirmPassword, role } = req.body;

    if (password !== confirmPassword) {
      return errorResponse(res, "Passwords do not match", 400);
    }

    if (!role || !["ADMIN", "EMPLOYER", "USER"].includes(role)) {
      return errorResponse(res, "Invalid or missing role", 400);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role,
      },
    });

    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("access_", accessToken, {
      httpOnly: true,
      secure: NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24,
      sameSite: "strict",
    });

    return successResponse(
      res,
      {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      "Account created successfully",
      201
    );
  } catch (error: any) {
    if (error.code === "P2002") {
      return errorResponse(
        res,
        "User with this email or username already exists",
        400
      );
    }
    return errorResponse(
      res,
      error.message || "Failed to create account",
      500,
      error
    );
  }
};

const getAccounts = async (req: Request, res: Response): Promise<any> => {
  try {
    const accounts = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
    return successResponse(res, accounts, "Accounts fetched successfully");
  } catch (error) {
    return errorResponse(res, "Failed to fetch accounts", 500, error);
  }
};

// Define a type for the response
interface UpdateAccountResponse {
  message: string;
  user?: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
}

// Define a type for the request body
interface UpdateAccountBody {
  username?: string;
  email?: string;
  role?: "ADMIN" | "EMPLOYER" | "USER";
  // Add other fields as needed, but avoid sensitive fields like password or role
}

const updateAccount = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const accountId = req.params.id as string;
    const { username, email, role } = req.body as UpdateAccountBody;

    if (!username && !email && !role) {
      return errorResponse(res, "At least one field must be provided", 400);
    }

    if (userRole !== "ADMIN" && userId !== accountId) {
      return errorResponse(res, "Unauthorized to update this account", 403);
    }

    const updateData: UpdateAccountBody = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (role) updateData.role = role;

    const updatedUser = await prisma.user.update({
      where: { id: accountId },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
      },
    });

    return successResponse(res, updatedUser, "Account updated successfully");
  } catch (error) {
    return errorResponse(res, "Failed to update account", 500, error);
  }
};

// Define a type for the response
interface DeleteAccountResponse {
  message: string;
}

const deleteAccount = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const accountId = req.params.id as string;

    if (userRole !== "ADMIN" && userId !== accountId) {
      return errorResponse(res, "Unauthorized to delete this account", 403);
    }

    await prisma.user.delete({
      where: { id: accountId },
    });

    return successResponse(res, null, "Account deleted successfully");
  } catch (error) {
    return errorResponse(res, "Failed to delete account", 500, error);
  }
};

const createProduct = async (req: Request, res: Response): Promise<any> => {
  try {
    return errorResponse(res, "Use main product controller for creation", 400);
  } catch (error) {
    return errorResponse(res, "Failed to create product", 500, error);
  }
};

const getProducts = async (req: Request, res: Response): Promise<any> => {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: { select: { categoryName: true } },
        images: true,
        variants: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return successResponse(res, products, "Products fetched successfully");
  } catch (error) {
    return errorResponse(res, "Failed to fetch products", 500, error);
  }
};

const getProductById = async (req: Request, res: Response): Promise<any> => {
  try {
    const productId = req.params.id as string;
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: { select: { categoryName: true } },
        images: true,
        variants: true,
      },
    });
    if (!product) return errorResponse(res, "Product not found", 404);
    return successResponse(res, product, "Product fetched successfully");
  } catch (error) {
    return errorResponse(res, "Failed to fetch product", 500, error);
  }
};

const updateProduct = async (req: Request, res: Response): Promise<any> => {
  try {
    const productId = req.params.id as string;
    const { title, description, categoryId, variants, images } = req.body;

    const updatedProduct = await prisma.$transaction(async (tx) => {
      const product = await tx.product.update({
        where: { id: productId },
        data: { title, description, categoryId },
      });

      if (variants && variants.length > 0) {
        await tx.variant.deleteMany({ where: { productId } });
        await tx.variant.createMany({
          data: variants.map((v: any) => ({
            productId,
            sku: v.sku,
            price: v.price,
            stock: v.stock,
            color: v.color,
            size: v.size,
          })),
        });
      }

      if (images && images.length > 0) {
        await tx.image.deleteMany({ where: { productId } });
        await tx.image.createMany({
          data: images.map((img: any) => ({
            productId,
            url: img.url,
            altText: img.altText,
            isPrimary: img.isPrimary,
          })),
        });
      }
      return product;
    });

    return successResponse(res, updatedProduct, "Product updated successfully");
  } catch (error) {
    return errorResponse(res, "Failed to update product", 500, error);
  }
};

const deleteProduct = async (req: Request, res: Response): Promise<any> => {
  try {
    const productId = req.params.id as string;
    await prisma.$transaction([
      prisma.image.deleteMany({ where: { productId } }),
      prisma.variant.deleteMany({ where: { productId } }),
      prisma.product.delete({ where: { id: productId } }),
    ]);
    return successResponse(res, null, "Product deleted successfully");
  } catch (error) {
    return errorResponse(res, "Failed to delete product", 500, error);
  }
};

const getCart = async (req: Request, res: Response): Promise<any> => {
  try {
    const carts = await prisma.cart.findMany({
      include: {
        user: { select: { username: true, email: true } },
        items: {
          include: {
            product: { select: { title: true } },
            variant: { select: { color: true, size: true } },
          },
        },
      },
    });
    return successResponse(res, carts, "Carts fetched successfully");
  } catch (error) {
    return errorResponse(res, "Failed to fetch carts", 500, error);
  }
};

const updateCart = async (req: Request, res: Response): Promise<any> => {
  try {
    const cartId = req.params.id as string;
    const cart = await prisma.cart.update({
      where: { id: cartId },
      data: { items: { deleteMany: {} } },
    });
    return successResponse(res, cart, "Cart updated (cleared) successfully");
  } catch (error) {
    return errorResponse(res, "Failed to update cart", 500, error);
  }
};

const deleteCart = async (req: Request, res: Response): Promise<any> => {
  try {
    const cartId = req.params.id as string;
    await prisma.cart.delete({ where: { id: cartId } });
    return successResponse(res, null, "Cart deleted successfully");
  } catch (error) {
    return errorResponse(res, "Failed to delete cart", 500, error);
  }
};

const getOrder = async (req: Request, res: Response): Promise<any> => {
  try {
    const orderId = req.params.id as string;
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: { select: { username: true, email: true } },
        shippingAddress: true,
        items: {
          include: {
            product: { select: { title: true } },
            variant: { select: { color: true, size: true, sku: true } },
          },
        },
      },
    });

    if (!order) return errorResponse(res, "Order not found", 404);
    return successResponse(res, order, "Order fetched successfully");
  } catch (error) {
    return errorResponse(res, "Failed to fetch order", 500, error);
  }
};

const getOrders = async (req: Request, res: Response): Promise<any> => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: { select: { username: true, email: true } },
        shippingAddress: true,
        items: {
          include: {
            product: { select: { title: true } },
            variant: { select: { color: true, size: true, sku: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return successResponse(res, orders, "Orders fetched successfully");
  } catch (error) {
    return errorResponse(res, "Failed to fetch orders", 500, error);
  }
};

const updateOrder = async (req: Request, res: Response): Promise<any> => {
  try {
    const orderId = req.params.id as string;
    const { status } = req.body;

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    return successResponse(res, order, "Order status updated successfully");
  } catch (error) {
    return errorResponse(res, "Failed to update order status", 500, error);
  }
};

const deleteOrder = async (req: Request, res: Response): Promise<any> => {
  try {
    const orderId = req.params.id as string;
    await prisma.order.delete({ where: { id: orderId } });
    return successResponse(res, null, "Order deleted successfully");
  } catch (error) {
    return errorResponse(res, "Failed to delete order", 500, error);
  }
};

const getSystemConfig = async (req: Request, res: Response): Promise<any> => {
  try {
    const config = await prisma.systemConfig.upsert({
      where: { id: "global" },
      update: {},
      create: {
        id: "global",
        siteName: "OASIS",
        maintenanceMode: false,
        globalDiscount: 0,
      },
    });
    return successResponse(
      res,
      config,
      "System configuration fetched successfully"
    );
  } catch (error) {
    return errorResponse(
      res,
      "Failed to fetch system configuration",
      500,
      error
    );
  }
};

const updateSystemConfig = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { siteName, maintenanceMode, globalDiscount, contactEmail } =
      req.body;
    const config = await prisma.systemConfig.update({
      where: { id: "global" },
      data: {
        siteName,
        maintenanceMode,
        globalDiscount,
        contactEmail,
      },
    });
    return successResponse(
      res,
      config,
      "System configuration updated successfully"
    );
  } catch (error) {
    return errorResponse(
      res,
      "Failed to update system configuration",
      500,
      error
    );
  }
};

const generateReport = async (req: Request, res: Response): Promise<any> => {
  try {
    const [totalRevenue, totalUsers, totalOrders, latestOrders] =
      await Promise.all([
        prisma.order.aggregate({
          _sum: { totalPrice: true },
        }),
        prisma.user.count(),
        prisma.order.count(),
        prisma.order.findMany({
          take: 10,
          orderBy: { createdAt: "desc" },
          include: { user: { select: { username: true, email: true } } },
        }),
      ]);

    const report = {
      generatedAt: new Date(),
      summary: {
        totalRevenue: totalRevenue._sum.totalPrice || 0,
        totalUsers,
        totalOrders,
        averageOrderValue:
          totalOrders > 0
            ? (Number(totalRevenue._sum.totalPrice || 0) / totalOrders).toFixed(
                2
              )
            : 0,
      },
      inventoryHealth: await prisma.variant.count({
        where: { stock: { lte: 10 } },
      }),
      recentActivity: latestOrders,
    };

    return successResponse(res, report, "Report generated successfully");
  } catch (error) {
    return errorResponse(res, "Failed to generate system report", 500, error);
  }
};

const getAdminStats = async (req: Request, res: Response): Promise<any> => {
  try {
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      globalRevenueResult,
      recentUsers,
      recentOrders,
      lowStockCount,
      uniqueCategoriesCount,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.aggregate({
        where: { NOT: { status: "CANCELLED" } },
        _sum: { totalPrice: true },
      }),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: { id: true, username: true, createdAt: true },
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { username: true } } },
      }),
      prisma.variant.count({ where: { stock: { lte: 10 } } }),
      prisma.category.count(),
    ]);

    const globalRevenue = globalRevenueResult?._sum?.totalPrice || 0;

    return successResponse(
      res,
      {
        stats: {
          totalUsers,
          totalProducts,
          totalOrders,
          globalRevenue,
          lowStockCount,
          uniqueCategoriesCount,
        },
        recentActivities: {
          users: recentUsers,
          orders: recentOrders,
        },
      },
      "Admin statistics fetched successfully"
    );
  } catch (error) {
    return errorResponse(res, "Failed to fetch admin statistics", 500, error);
  }
};

const getEmployerStats = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    if (!userId) return errorResponse(res, "Unauthorized", 401);

    const [products, recentProducts] = await Promise.all([
      prisma.product.findMany({
        where: { userId },
        include: { variants: true },
      }),
      prisma.product.findMany({
        where: { userId },
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          variants: { take: 1 },
        },
      }),
    ]);

    const orderItems = await prisma.orderItem.findMany({
      where: { product: { userId } },
      include: { order: true },
    });

    const totalOrders = new Set(orderItems.map((item) => item.orderId)).size;
    const totalRevenue = orderItems.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0
    );

    return successResponse(
      res,
      {
        stats: {
          totalRevenue,
          totalOrders,
          activeListings: products.length,
          salesVelocity: totalOrders > 0 ? (totalOrders / 30).toFixed(1) : "0",
        },
        recentListings: recentProducts,
      },
      "Employer statistics fetched successfully"
    );
  } catch (error) {
    return errorResponse(
      res,
      "Failed to fetch employer statistics",
      500,
      error
    );
  }
};

const getDetailedAnalytics = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const [revenueByCategory, userGrowth, inventoryHealth, monthlyRevenueData] =
      await Promise.all([
        prisma.category.findMany({
          include: {
            products: {
              include: {
                orderItems: {
                  select: { price: true, quantity: true },
                },
              },
            },
          },
        }),
        prisma.user.count({
          where: { createdAt: { gte: sixMonthsAgo } },
        }),
        prisma.variant.findMany({
          where: { stock: { lte: 10 } },
          include: { product: { select: { title: true } } },
          take: 10,
        }),
        prisma.order.findMany({
          where: {
            createdAt: { gte: sixMonthsAgo },
            NOT: { status: "CANCELLED" },
          },
          select: { totalPrice: true, createdAt: true },
        }),
      ]);

    const categoryRevenue = revenueByCategory.map((cat) => ({
      name: cat.categoryName,
      revenue: cat.products.reduce(
        (acc, prod) =>
          acc +
          prod.orderItems.reduce(
            (sum, item) => sum + Number(item.price) * item.quantity,
            0
          ),
        0
      ),
    }));

    const months = [
      "JAN",
      "FEB",
      "MAR",
      "APR",
      "MAY",
      "JUN",
      "JUL",
      "AUG",
      "SEP",
      "OCT",
      "NOV",
      "DEC",
    ];
    const monthlyStats = Array.from({ length: 6 })
      .map((_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const monthName = months[d.getMonth()];
        const revenue = monthlyRevenueData
          .filter(
            (o) =>
              new Date(o.createdAt).getMonth() === d.getMonth() &&
              new Date(o.createdAt).getFullYear() === d.getFullYear()
          )
          .reduce((acc, o) => acc + Number(o.totalPrice), 0);
        return { month: monthName, revenue };
      })
      .reverse();

    return successResponse(
      res,
      {
        categoryRevenue,
        userGrowth,
        inventoryHealth,
        monthlyStats,
      },
      "Detailed analytics fetched successfully"
    );
  } catch (error) {
    return errorResponse(res, "Failed to fetch detailed analytics", 500, error);
  }
};

const getEmployerProducts = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const userId = req.user?.id;
    if (!userId) return errorResponse(res, "Unauthorized", 401);

    const products = await prisma.product.findMany({
      where: { userId },
      include: {
        category: { select: { categoryName: true } },
        images: true,
        variants: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return successResponse(
      res,
      products,
      "Employer products fetched successfully"
    );
  } catch (error) {
    return errorResponse(res, "Failed to fetch employer products", 500, error);
  }
};

const getEmployerOrders = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    if (!userId) return errorResponse(res, "Unauthorized", 401);

    const orderItems = await prisma.orderItem.findMany({
      where: { product: { userId } },
      include: {
        order: {
          include: {
            user: { select: { username: true, email: true } },
            shippingAddress: true,
          },
        },
        product: { select: { title: true } },
        variant: { select: { color: true, size: true, sku: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const ordersMap = new Map();
    orderItems.forEach((item: any) => {
      if (!ordersMap.has(item.orderId)) {
        ordersMap.set(item.orderId, {
          ...item.order,
          items: [],
        });
      }
      ordersMap.get(item.orderId).items.push({
        id: item.id,
        productId: item.productId,
        productTitle: item.product.title,
        variantInfo: `${item.variant.color} / ${item.variant.size}`,
        sku: item.variant.sku,
        quantity: item.quantity,
        price: item.price,
        status: item.status,
        trackingNumber: item.trackingNumber,
      });
    });

    const orders = Array.from(ordersMap.values());
    return successResponse(res, orders, "Employer orders fetched successfully");
  } catch (error) {
    return errorResponse(res, "Failed to fetch employer orders", 500, error);
  }
};

const updateOrderItemStatus = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const userId = req.user?.id;
    const { orderItemId, status, trackingNumber } = req.body;

    if (!userId) return errorResponse(res, "Unauthorized", 401);

    const orderItem = await prisma.orderItem.findUnique({
      where: { id: orderItemId },
      include: { product: true },
    });

    if (!orderItem || orderItem.product.userId !== userId) {
      return errorResponse(res, "Forbidden: Not your product", 403);
    }

    const updated = await prisma.orderItem.update({
      where: { id: orderItemId },
      data: {
        status,
        trackingNumber: trackingNumber || undefined,
      },
    });

    return successResponse(
      res,
      updated,
      "Order item status updated successfully"
    );
  } catch (error) {
    return errorResponse(res, "Failed to update order item status", 500, error);
  }
};

export {
  createAccount,
  getAccounts,
  updateAccount,
  deleteAccount,
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getCart,
  updateCart,
  deleteCart,
  getOrder,
  updateOrder,
  deleteOrder,
  getAdminStats,
  getEmployerStats,
  getDetailedAnalytics,
  getSystemConfig,
  updateSystemConfig,
  generateReport,
  getEmployerProducts,
  getEmployerOrders,
  getOrders,
  updateOrderItemStatus,
};
