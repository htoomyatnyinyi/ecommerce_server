import { Request, Response } from "express";
import prisma from "../config/database";
import { successResponse, errorResponse } from "../utils/response";

// Add item to cart
export const addToCart = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return errorResponse(res, "Unauthorized: User not authenticated", 401);
    }

    const { productId, variantId, quantity = 1 } = req.body;

    if (!productId || !variantId) {
      return errorResponse(res, "Product ID and Variant ID are required", 400);
    }

    // Check if product and variant exist
    const variant = await prisma.variant.findUnique({
      where: { id: variantId },
      include: { product: true },
    });

    if (!variant || variant.productId !== productId) {
      return errorResponse(res, "Product or Variant not found", 404);
    }

    // Find or create user cart
    let userCart = await prisma.cart.findFirst({
      where: { userId },
    });

    if (!userCart) {
      userCart = await prisma.cart.create({
        data: { userId },
      });
    }

    // Check if item already in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: userCart.id,
        productId,
        variantId,
      },
    });

    let cartItem;
    if (existingItem) {
      // Update quantity
      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
        include: { product: true, variant: true },
      });
    } else {
      // Create new cart item
      cartItem = await prisma.cartItem.create({
        data: {
          cartId: userCart.id,
          productId,
          variantId,
          quantity,
        },
        include: { product: true, variant: true },
      });
    }

    return successResponse(res, cartItem, "Item added to cart successfully");
  } catch (error) {
    return errorResponse(res, "Failed to add item to cart", 500, error);
  }
};

// Get user's cart
export const getCart = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return errorResponse(res, "Unauthorized", 401);
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { cart: { userId } },
      include: {
        product: {
          include: { images: true },
        },
        variant: true,
      },
      orderBy: { createdAt: "desc" },
    });

    let totalPrice = 0;
    let totalQuantity = 0;

    cartItems.forEach((item) => {
      const price = Number(item.variant?.price) || 0;
      const quantity = Number(item.quantity) || 0;
      totalPrice += price * quantity;
      totalQuantity += quantity;
    });

    return successResponse(res, {
      items: cartItems,
      totalPrice,
      totalQuantity,
    });
  } catch (error) {
    return errorResponse(res, "Failed to fetch cart", 500, error);
  }
};

// Remove item from cart
export const removeCart = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    const { removeCartItemId } = req.body;

    if (!userId) return errorResponse(res, "Unauthorized", 401);
    if (!removeCartItemId)
      return errorResponse(res, "Item ID is required", 400);

    const deletedItem = await prisma.cartItem.delete({
      where: { id: removeCartItemId, cart: { userId } },
    });

    return successResponse(res, deletedItem, "Item removed from cart");
  } catch (error) {
    return errorResponse(res, "Failed to remove item from cart", 500, error);
  }
};

// Update cart item quantity
export const updateCart = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    const { cartItemId, quantity } = req.body;

    if (!userId) return errorResponse(res, "Unauthorized", 401);
    if (!cartItemId || quantity === undefined)
      return errorResponse(res, "Item ID and quantity are required", 400);

    const updatedItem = await prisma.cartItem.update({
      where: { id: cartItemId, cart: { userId } },
      data: { quantity: Math.max(1, quantity) },
    });

    return successResponse(res, updatedItem, "Cart updated");
  } catch (error) {
    return errorResponse(res, "Failed to update cart", 500, error);
  }
};

// Calculate cart total
export const cartTotal = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    if (!userId) return errorResponse(res, "Unauthorized", 401);

    const cart = await prisma.cart.findFirst({
      where: { userId },
      include: {
        items: {
          include: { variant: true },
        },
      },
    });

    if (!cart) {
      return successResponse(res, { totalPrice: 0, items: [] });
    }

    let totalPrice = 0;
    cart.items.forEach((item) => {
      const price = Number(item.variant?.price) || 0;
      totalPrice += price * item.quantity;
    });

    return successResponse(res, { totalPrice, items: cart.items });
  } catch (error) {
    return errorResponse(res, "Failed to calculate total", 500, error);
  }
};
