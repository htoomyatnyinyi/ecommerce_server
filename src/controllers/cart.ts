import { Request, Response } from "express";
import prisma from "../config/database";

export const addToCart = async (req: Request, res: Response) => {
  const userId = req.user?.id; // From auth middleware
  const { variantId, quantity = 1 } = req.body;

  // Validate input
  if (!variantId || quantity < 1) {
    return res.status(400).json({ error: "Invalid input" });
  }

  try {
    // Find or create user's cart
    let cart = await prisma.cart.findFirst({
      where: { userId },
      include: { items: true },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: { items: true },
      });
    }

    // Check if item already exists in cart
    const existingItem = cart.items.find(
      (item) => item.variantId === variantId
    );

    if (existingItem) {
      // Update quantity if item exists
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    } else {
      // Add new item to cart
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          variantId,
          quantity,
        },
      });
    }

    // Return updated cart
    const updatedCart = await prisma.cart.findFirst({
      where: { userId },
      include: { items: { include: { variant: true } } },
    });

    res.status(200).json(updatedCart);
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ error: "Failed to add to cart" });
  }
};
