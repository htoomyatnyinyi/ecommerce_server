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

  if (!userId) {
    return res
      .status(401)
      .json({ error: "Unauthorized: User not authenticated." });
  }
  // const data = req.body;

  const { productId, variantId, quantity } = req.body;
  console.log(productId, variantId, quantity, "at addToCart");

  try {
    // Check if product exists and has enough stock
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({ msg: "Product Not Found" });
    }

    // Check if item already in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: { cart: { userId }, productId: productId, variantId: variantId },
    });

    // console.log(existingItem, "eistingItem");

    let cartItem;
    if (existingItem) {
      // update quantity
      // console.log(existingItem, "alredy existing cart");
      res.json(existingItem);
      // cartItem = await prisma.cartItem.update({
      //   where: { id: existingItem.id }, // only for add to cart but variantId haven't apply
      //   data: { quantity: existingItem.quantity + quantity },
      //   include: { product: true },
      // });
      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id }, // Ensure variantId is included in the update
        data: { quantity: existingItem.quantity + quantity },
        include: {
          product: true,
          variant: true, // Include variant details if needed
        },
      });
    } else {
      // Find the user's cart by userId
      let userCart = await prisma.cart.findFirst({
        where: { userId },
      });

      // If the cart doesn't exist, create one
      if (!userCart) {
        userCart = await prisma.cart.create({
          data: { userId },
        });
      }

      // add new item to cartItem table
      cartItem = await prisma.cartItem.create({
        data: {
          cart: { connect: { id: userCart.id } },
          product: { connect: { id: productId } },
          variant: { connect: { id: variantId } }, // Assuming variantId is provided
          quantity,
        },
        include: {
          product: true,
          variant: true, // Include variant details if needed
        },
      });

      // #

      // add new item into cart table
      // const cartItem = await prisma.cart.create({
      //   data: {
      //     userId,
      //     items: {
      //       create: {
      //         productId,
      //         variantId,
      //         quantity,
      //       },
      //     },
      //   },
      //   include: {
      //     items: {
      //       select: {
      //         id: true,
      //         cartId: true,
      //         quantity: true,
      //       },
      //     },
      //   },
      // });
      res.json(cartItem);
    }
  } catch (error) {
    res.status(500).json({ msg: "error" });
  }
};

const getCart = async (req: Request, res: Response): Promise<any> => {
  const userId = req.user?.id; // Assuming user ID is stored in req.user
  if (!userId) {
    return res
      .status(401)
      .json({ error: "Unauthorized: User not authenticated." });
  }
  // console.log("User ID:", userId);

  try {
    const getCart = await prisma.cart.findMany({
      include: {
        items: {
          include: {
            // product: {
            //   select: { title: true, description: true },
            // },
            product: true,
            // variant: {
            //   select: { sku: true, stock: true, price: true },
            // },
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
    // console.log({ ...getCart });
    res.status(200).json(getCart);
  } catch (error) {
    console.error(error);
  }
};

const removeCart = async (req: Request, res: Response): Promise<any> => {
  const userId = req.user?.id;
  const removeCartId = req.body;
  // const removeCartId = req.params.id;

  if (!userId) {
    return res
      .status(401)
      .json({ error: "Unauthorized: User not authenticated." });
  }

  try {
    await prisma.cartItem.delete({
      where: { id: removeCartId, cart: { userId } },
    });
    res.json({ msg: "remove cart already." });
  } catch (error) {
    console.error(error);
  }
};

const cartTotal = async (req: Request, res: Response): Promise<any> => {
  const { cartId } = req.body;
  // console.log(cartId, req.body);

  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { id: cartId },
      include: { product: true, variant: true },
    });

    console.log(cartItems);
    let totalPrice = 0;
    cartItems.forEach((item) => {
      const price = Number(item.variant?.price) || 0;
      const quantity = Number(item.quantity) || 0;
      totalPrice += price * quantity;
    });
    res.status(201).json(totalPrice);
  } catch (error) {
    console.error(error);
  }
};

export { addToCart, getCart, removeCart, cartTotal };
