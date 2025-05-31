import { Request, Response } from "express";

const addToCart = (req: Request, res: Response) => {
  res.json({ m: "Hi" });
};
const getCart = (req: Request, res: Response) => {
  res.send("HiGet");
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
