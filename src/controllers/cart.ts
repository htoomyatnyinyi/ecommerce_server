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

const addToCart = async (req: Request, res: Response): Promise<any> => {
  const userId = req.user?.id;
  const data = req.body;

  if (!userId) {
    return res
      .status(401)
      .json({ error: "Unauthorized: User not authenticated." });
  }
  console.log(req.body, "at addToCart");
  // if (!data || !data.items || !Array.isArray(data.items)) {
  //   return res.status(400).json({ error: "Bad Request: Invalid cart data." });
  // }
  // console.log("Data received:", data);
  // try {
  //   const cart = await prisma.cart.create({
  //     data: {
  //       userId,
  //       items: {
  //         create: data.items.map((item: CartItem) => ({
  //           productId: item.productId,
  //           variantId: item.variantId,
  //           quantity: item.quantity,
  //         })),
  //       },
  //     },
  //     include: { items: true },
  //   });
  //   res.json(cart);
  // } catch (error) {
  //   res.status(500).json({ error: (error as any).message });
  // }
};

const getCart = async (req: Request, res: Response): Promise<any> => {
  const userId = req.user?.id; // Assuming user ID is stored in req.user
  if (!userId) {
    return res
      .status(401)
      .json({ error: "Unauthorized: User not authenticated." });
  }
  console.log("User ID:", userId);

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
