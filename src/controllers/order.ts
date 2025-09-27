import { Request, Response } from "express";
import prisma from "../config/database";

export const getOrder = async (req: Request, res: Response): Promise<any> => {
  const userId = req.user?.id;
  if (!userId) {
    return res
      .status(401)
      .json({ message: "Unauthorized: User not authenticated" });
  }
  try {
    const orders = await prisma.order.findMany({ where: { userId } });
    res.status(200).json({ message: "Orders retrieved successfully", orders });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get orders",
      error,
    });
  }
};

// ...existing code...
export const createOrder = async (
  req: Request,
  res: Response
): Promise<any> => {
  const userId = req.user?.id;
  if (!userId) {
    return res
      .status(401)
      .json({ message: "Unauthorized: User not authenticated" });
  }

  try {
    const getShippingAddressId = await prisma.address.findFirst({
      where: { userId, isDefault: true },
    });

    if (!getShippingAddressId) {
      return res.status(400).json({ message: "Invalid shipping address ID" });
    }

    // Fetch cart items for the user
    const cartItems = await prisma.cartItem.findMany({
      // where: { userId },
      include: { product: true }, // Assuming cartItem has relation to product
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Prepare order items and calculate total price
    const orderItems = cartItems.map((item) => ({
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      price: 1000 * item.quantity, // Multiply price by quantity
      // price: item.product.price * item.quantity, // Multiply price by quantity
    }));

    const totalPrice = orderItems.reduce((sum, item) => sum + item.price, 0);

    // Create the order
    const newOrder = await prisma.order.create({
      data: {
        userId,
        totalPrice,
        shippingAddressId: getShippingAddressId.id,
        // items: {
        //   create: orderItems,
        // },
      },
      include: { items: true },
    });

    res.status(200).json({ message: "Order created.", newOrder });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create order",
      error,
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
