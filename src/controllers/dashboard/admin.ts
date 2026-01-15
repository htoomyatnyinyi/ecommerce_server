import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "../../config/database";
import { JWT_SECRET, NODE_ENV } from "../../utils/secrets";
import bcrypt from "bcrypt";
import { createAccountType } from "../../types/adminTypes";

const createAccount = async (
  req: Request<{}, {}, createAccountType>,
  res: Response
): Promise<any> => {
  // const userId = req.user?.id; // const {id} = req.user

  // console.log(userId, "middleware");

  try {
    const { username, email, password, confirmPassword, role } = req.body;

    if (password !== confirmPassword) {
      res.status(400).json({ error: "Passwords do not match" });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log(role, "role");
    if (!role) {
      res.status(400).json({ error: "Role is required" });
      return;
    }
    if (!["ADMIN", "EMPLOYER", "USER"].includes(role)) {
      res.status(400).json({ error: "Invalid role" });
      return;
    }

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role,
      },
    });

    // console.log(user, "check");

    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      {
        expiresIn: "1d", //7
      }
    );

    res.cookie("access_", accessToken, {
      httpOnly: true,
      secure: NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      sameSite: "strict",
    });

    res.status(201).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    console.log(error);
    if (error.code === "P2002") {
      res.status(400).json({
        error: "User with this email or username already exists",
      });
      return;
    }
    res.status(400).json({ error: error.message });
  }
};

// const getAccount = async (req: Request, res: Response): Promise<any> => {
//   const userId = req.user?.id; // const {id} = req.user

//   console.log(userId, "middleware");

//   try {
//     res.status(201).json({ mesg: "success" });
//   } catch (error) {}
// };

const getAccounts = async (req: Request, res: Response): Promise<any> => {
  const userId = req.user?.id;
  const userRole = req.user?.role;

  console.log(userId, userRole, "middleware");

  try {
    const accounts = await prisma.user.findMany();
    console.log(accounts);
    res.status(200).json(accounts);
  } catch (error) {
    res.status(400).json(error);
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

const updateAccount = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id; // Admin or user ID from middleware
    const userRole = req.user?.role; // Role from middleware
    const { id: accountId }: any = req.params; // Extract accountId from params
    const { username, email, role } = req.body as UpdateAccountBody; // Extract fields to update

    // Validate input
    if (!accountId) {
      res.status(400).json({ message: "Account ID is required" });
      return;
    }

    if (!username && !email && !role) {
      res.status(400).json({
        message: "At least one field (username or email) must be provided",
      });
      return;
    }

    // Authorization check
    if (userRole !== "ADMIN" && userId !== accountId) {
      res.status(403).json({ message: "Unauthorized to update this account" });
      return;
    }

    // Prepare update data, only including provided fields
    const updateData: UpdateAccountBody = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (role) updateData.role = role;

    // Perform the update
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

    // Send response
    res.status(200).json({
      message: "Account updated successfully",
      user: updatedUser,
    } as UpdateAccountResponse);
  } catch (error) {
    console.error("Error updating account:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Define a type for the response
interface DeleteAccountResponse {
  message: string;
}

const deleteAccount = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id; // Admin or user ID from middleware
    const userRole = req.user?.role; // Role from middleware
    const { id: accountId }: any = req.params; // Extract accountId from params

    // Validate input
    if (!accountId) {
      res.status(400).json({ message: "Account ID is required" });
      return;
    }

    // Authorization check
    if (userRole !== "ADMIN" && userId !== accountId) {
      res.status(403).json({ message: "Unauthorized to delete this account" });
      return;
    }

    // Check if the user exists
    const user = await prisma.user.findUnique({
      where: { id: accountId },
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Perform the deletion
    await prisma.user.delete({
      where: { id: accountId },
    });

    // Send response
    res.status(200).json({
      message: "Account deleted successfully",
    } as DeleteAccountResponse);
  } catch (error) {
    console.error("Error deleting account:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const createProduct = async (req: Request, res: Response): Promise<any> => {
  const userId = req.user?.id; // const {id} = req.user

  console.log(userId, "middleware");

  try {
    res.status(201).json({ mesg: "success" });
  } catch (error) {}
};
const getProducts = async (req: Request, res: Response): Promise<any> => {
  const userId = req.user?.id; // const {id} = req.user

  console.log(userId, "middleware");

  try {
    res.status(201).json({ mesg: "success" });
  } catch (error) {}
};

const getProductById = async (req: Request, res: Response): Promise<any> => {
  const userId = req.user?.id; // const {id} = req.user

  console.log(userId, "middleware");

  try {
    res.status(201).json({ mesg: "success" });
  } catch (error) {}
};

const updateProduct = async (req: Request, res: Response): Promise<any> => {
  const { id }: any = req.params;
  const { title, description, categoryId, variants, images } = req.body;

  try {
    const updatedProduct = await prisma.$transaction(async (tx) => {
      // Update basic product info
      const product = await tx.product.update({
        where: { id },
        data: {
          title,
          description,
          categoryId,
        },
      });

      // Handle variants
      if (variants && variants.length > 0) {
        // Simple approach: delete existing and create new
        // Better approach: update existing, create new, delete missing
        // For now, let's go with the simpler approach for this MVP
        await tx.variant.deleteMany({ where: { productId: id } });
        await tx.variant.createMany({
          data: variants.map((v: any) => ({
            productId: id,
            sku: v.sku,
            price: v.price,
            stock: v.stock,
            color: v.color,
            size: v.size,
          })),
        });
      }

      // Handle images
      if (images && images.length > 0) {
        await tx.image.deleteMany({ where: { productId: id } });
        await tx.image.createMany({
          data: images.map((img: any) => ({
            productId: id,
            url: img.url,
            altText: img.altText,
            isPrimary: img.isPrimary,
          })),
        });
      }

      return product;
    });

    res.status(200).json({ success: true, data: updatedProduct });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ message: "Failed to update product" });
  }
};

const deleteProduct = async (req: Request, res: Response): Promise<any> => {
  const { id }: any = req.params;

  try {
    await prisma.$transaction([
      prisma.image.deleteMany({ where: { productId: id } }),
      prisma.variant.deleteMany({ where: { productId: id } }),
      prisma.product.delete({ where: { id } }),
    ]);

    res
      .status(200)
      .json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ message: "Failed to delete product" });
  }
};

const getCart = async (req: Request, res: Response): Promise<any> => {
  const userId = req.user?.id; // const {id} = req.user

  console.log(userId, "middleware");

  try {
    res.status(201).json({ mesg: "success" });
  } catch (error) {}
};

const updateCart = async (req: Request, res: Response): Promise<any> => {
  const userId = req.user?.id; // const {id} = req.user

  console.log(userId, "middleware");

  try {
    res.status(201).json({ mesg: "success" });
  } catch (error) {}
};

const deleteCart = async (req: Request, res: Response): Promise<any> => {
  const userId = req.user?.id; // const {id} = req.user

  console.log(userId, "middleware");

  try {
    res.status(201).json({ mesg: "success" });
  } catch (error) {}
};

const getOrder = async (req: Request, res: Response): Promise<any> => {
  const userId = req.user?.id; // const {id} = req.user

  console.log(userId, "middleware");

  try {
    res.status(201).json({ mesg: "success" });
  } catch (error) {}
};

const updateOrder = async (req: Request, res: Response): Promise<any> => {
  const userId = req.user?.id; // const {id} = req.user

  console.log(userId, "middleware");

  try {
    res.status(201).json({ mesg: "success" });
  } catch (error) {}
};

const deleteOrder = async (req: Request, res: Response): Promise<any> => {
  const userId = req.user?.id; // const {id} = req.user

  console.log(userId, "middleware");
  try {
    res.status(201).json({ mesg: "success" });
  } catch (error) {}
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
    res.status(200).json({ success: true, data: config });
  } catch (error) {
    console.error("Get system config error:", error);
    res.status(500).json({ message: "Failed to fetch system config" });
  }
};

const updateSystemConfig = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { siteName, maintenanceMode, globalDiscount, contactEmail } = req.body;
  try {
    const config = await prisma.systemConfig.update({
      where: { id: "global" },
      data: {
        siteName,
        maintenanceMode,
        globalDiscount,
        contactEmail,
      },
    });
    res.status(200).json({ success: true, data: config });
  } catch (error) {
    console.error("Update system config error:", error);
    res.status(500).json({ message: "Failed to update system config" });
  }
};

const generateReport = async (req: Request, res: Response): Promise<any> => {
  try {
    const [totalRevenue, totalUsers, totalOrders, latestOrders, categorySales] =
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
        prisma.product.findMany({
          select: {
            title: true,
            category: { select: { categoryName: true } },
            orderItems: {
              select: {
                quantity: true,
                price: true,
              },
            },
          },
        }),
      ]);

    // Simple report summary
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

    res.status(200).json({ success: true, report });
  } catch (error) {
    console.error("Generate report error:", error);
    res.status(500).json({ message: "Failed to generate system report" });
  }
};

const getAdminStats = async (req: Request, res: Response): Promise<void> => {
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

    res.status(200).json({
      success: true,
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
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getEmployerStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

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

    // Find all orders that contain products belonging to this employer
    // This requires checking OrderItem -> Product -> userId
    const orderItems = await prisma.orderItem.findMany({
      where: { product: { userId } },
      include: { order: true },
    });

    const totalOrders = new Set(orderItems.map((item) => item.orderId)).size;
    const totalRevenue = orderItems.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0
    );

    res.status(200).json({
      success: true,
      stats: {
        totalRevenue,
        totalOrders,
        activeListings: products.length,
        salesVelocity: totalOrders > 0 ? (totalOrders / 30).toFixed(1) : "0", // Simplified dummy velocity
      },
      recentListings: recentProducts,
    });
  } catch (error) {
    console.error("Error fetching employer stats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getDetailedAnalytics = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // User Growth (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const [revenueByCategory, userGrowth, inventoryHealth, monthlyRevenueData] =
      await Promise.all([
        // Revenue by Category (more efficient query)
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
        // User Growth
        prisma.user.count({
          where: { createdAt: { gte: sixMonthsAgo } },
        }),
        // Low stock alerts
        prisma.variant.findMany({
          where: { stock: { lte: 10 } },
          include: { product: { select: { title: true } } },
          take: 10,
        }),
        // Monthly Revenue for Chart
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

    // Process monthly revenue
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

    res.status(200).json({
      success: true,
      categoryRevenue,
      userGrowth,
      inventoryHealth,
      monthlyStats,
    });
  } catch (error) {
    console.error("Error fetching detailed analytics:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getEmployerProducts = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const products = await prisma.product.findMany({
      where: { userId },
      include: {
        category: { select: { categoryName: true } },
        images: true,
        variants: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ success: true, products });
  } catch (error) {
    console.error("Get employer products error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getEmployerOrders = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // Find all order items that belong to products owned by this employer
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

    // Group items by order to show them as distinct orders in the UI
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
    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("Get employer orders error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateOrderItemStatus = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const userId = req.user?.id;
    const { orderItemId, status, trackingNumber } = req.body;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // Verify the order item belongs to the merchant
    const orderItem = await prisma.orderItem.findUnique({
      where: { id: orderItemId },
      include: { product: true },
    });

    if (!orderItem || orderItem.product.userId !== userId) {
      return res.status(403).json({ message: "Forbidden: Not your product" });
    }

    const updated = await prisma.orderItem.update({
      where: { id: orderItemId },
      data: {
        status,
        trackingNumber: trackingNumber || undefined,
      },
    });

    // Optional: Check if all items in the order are SHIPPED/DELIVERED and update main order status
    // For now, keep it simple.

    res.status(200).json({ success: true, orderItem: updated });
  } catch (error) {
    console.error("Update order item status error:", error);
    res.status(500).json({ message: "Internal server error" });
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
  updateOrderItemStatus,
};
