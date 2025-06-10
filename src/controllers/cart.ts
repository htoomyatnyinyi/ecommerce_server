import { Request, Response } from "express";
import prisma from "../config/database";
interface CartItem {
  productId: string;
  variantId: string;
  quantity: number;
}
interface CartRequest {
  items: CartItem[];
  // You can add more fields if needed, like userId, etc.
  // userId?: string; // Optional if you want to include userId in the request
}
const addToCart = async (
  req: Request<{}, {}, CartRequest>,
  res: Response
): Promise<any> => {
  const userId = req.user?.id; // Assuming user ID is stored in req.user
  if (!userId) {
    return res
      .status(401)
      .json({ error: "Unauthorized: User not authenticated." });
  }

  const data = req.body; // Assuming the request body contains the cart data
  // Here you would typically process the data, e.g., save it to a database
  console.log(
    "Data pure received:",
    data.items.map((item) => item.productId)
  );

  // const cart = {
  //   userId: userId,
  //   items: data, // Assuming items is an array of cart items
  // };
  // // // Here you would typically save the cart to a database
  // console.log("Cart to be saved:", cart);

  // const respoonse = await prisma.cart.create({
  //   data: {
  //     userId,
  //     items: {
  //       create: data.items.map((item) => ({
  //         productId: item.productId,
  //         variantId: item.variantId,
  //         quantity: item.quantity,
  //       })),
  //     },
  //   },
  // });

  const respoonse = await prisma.cart.create({
    data: {
      userId,
      items: {
        create: data.items.map((item: CartItem) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
        })),
      },
    },
    include: {
      items: true, // Include items in the response
      // You can include other related models if needed
      // e.g., product, variant, etc.
      // product: true,
      // variant: true,
    },
  });
  console.log("Cart saved:", respoonse);

  res.json(respoonse);
  // For demonstration, we'll just send a response back
  // res.json({ data, message: "Cart updated successfully" });
};

// const getCart = async (req: Request, res: Response): Promise<any> => {
//   try {
//     const getCart = await prisma.cart.findMany();
//     res.json(getCart);
//   } catch (error) {
//     console.error(error);
//   }
// };

const getCart = async (req: Request, res: Response): Promise<any> => {
  try {
    const getCart = await prisma.cart.findMany({
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });
    // console.log(getCart, "getCart");
    // res.json(getCart);
    if (!getCart || getCart.length === 0) {
      return res.status(404).json({ message: "Cart is empty" });
    }
    // If you want to return the cart items with product and variant details
    // res.json(getCart);
    // If you want to return the cart items without product and variant details
    // res.json(getCart.map(cart => cart.items));
    res.json(getCart);
  } catch (error) {
    console.error(error);
  }
};

export { addToCart, getCart };

// import { Request, Response } from "express";
// import { PrismaClient } from "@prisma/client";
// // import { CartRequest } from "../types";
// import { CartRequest } from "../types/productTypes";
// // import { AuthRequest } from "../middleware/auth.middleware";
// // import { z } from "zod";

// const prisma = new PrismaClient();

// // const CartSchema = z.object({
// //   userId: z.string().uuid(),
// //   items: z.array(
// //     z.object({
// //       productId: z.string().uuid(),
// //       variantId: z.string().uuid(),
// //       quantity: z.number().int().positive(),
// //     })
// //   ),
// // });

// export const createOrUpdateCart = async (
//   req: Request,
//   res: Response
// ): Promise<any> => {
//   const data = req.body as CartRequest;
//   try {
//     const cart = await prisma.cart.upsert({
//       where: { userId: req.user!.id },
//       update: {
//         items: { deleteMany: {}, create: data.items },
//         updatedAt: new Date(),
//       },
//       create: {
//         userId: req.user!.id,
//         items: { create: data.items },
//       },
//       include: { items: true },
//     });
//     res.json(cart);
//   } catch (error) {
//     res.status(500).json({ error: (error as any).message });
//   }
// };

// export const getCart = async (req: Request, res: Response) => {
//   try {
//     const cart = await prisma.cart.findUnique({
//       where: { userId: req.user!.id },
//       include: { items: { include: { product: true, variant: true } } },
//     });
//     res.json(cart || { items: [] });
//   } catch (error) {
//     res.status(500).json({ error: (error as any).message });
//   }
// }; // import { Request, Response } from "express";
// // import prisma from "../config/database";
// // import { CartRequest } from "../types/productTypes";

// // const addToCart = async (
// //   // req: Request<{}, {}, CartRequest>,
// //   req: Request,
// //   res: Response
// // ): Promise<any> => {
// //   //
// //   if (!req.user || !req.user.id) {
// //     return res
// //       .status(401)
// //       .json({ error: "Unauthorized: User not authenticated." });
// //   }
// //   const userId = req.user.id;
// //   // console.log(userId, "middleware", req.body);

// //   const { items } = req.body; // assuming items is sent in the request body

// //   const cart = await prisma.cart.create({
// //     data: {
// //       userId: userId,
// //       items: {
// //         create: items, // items should be an array of item objects
// //       },
// //     },
// //   });
// //   // const {} = req.body;
// // };

// // const getCart = async (req: Request, res: Response): Promise<any> => {
// //   res.send("Hi");
// // };

// // export { addToCart, getCart };
