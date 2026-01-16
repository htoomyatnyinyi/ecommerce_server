import { Request, Response } from "express";
import prisma from "../config/database";

/**
 * @description Get all addresses for the logged-in user
 * @route GET /api/addresses
 * @access Private
 */
export const getAddresses = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  try {
    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json(addresses);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve addresses." });
  }
};

/**
 * @description Create a new address for the logged-in user
 * @route POST /api/addresses
 * @access Private
 */
export const createAddress = async (
  req: Request,
  res: Response
): Promise<any> => {
  const userId = req.user?.id;
  if (!userId) {
    return res
      .status(401)
      .json({ error: "Unauthorized: User not authenticated." });
  }

  const { label, street, city, state, country, postalCode, isDefault } =
    req.body;

  console.log(req.body);

  if (!street || !city || !country || !postalCode) {
    return res.status(400).json({ error: "Missing required address fields." });
  }

  try {
    // If setting a new default, we need a transaction
    if (isDefault) {
      const [_, newAddress] = await prisma.$transaction([
        // 1. Set all other addresses for this user to isDefault: false
        prisma.address.updateMany({
          where: { userId },
          data: { isDefault: false },
        }),
        // 2. Create the new address as the default
        prisma.address.create({
          data: {
            userId,
            label,
            street,
            city,
            state,
            country,
            postalCode,
            isDefault: true,
          },
        }),
      ]);
      return res.status(201).json(newAddress);
    }

    // If not setting as default, just create it
    const newAddress = await prisma.address.create({
      data: {
        userId,
        label,
        street,
        city,
        state,
        country,
        postalCode,
        isDefault: false,
      },
    });
    return res.status(201).json(newAddress);
  } catch (error) {
    res.status(500).json({ error: "Failed to create address." });
  }
};

/**
 * @description Update an existing address
 * @route PUT /api/addresses/:id
 * @access Private
 */
export const updateAddress = async (
  req: Request,
  res: Response
): Promise<any> => {
  const userId = req.user?.id;
  const { id: addressId }: any = req.params;
  const { label, street, city, state, country, postalCode, isDefault } =
    req.body;

  try {
    if (isDefault) {
      const [_, updatedAddress] = await prisma.$transaction([
        // 1. Unset any other default addresses for the user
        prisma.address.updateMany({
          where: { userId, NOT: { id: addressId } },
          data: { isDefault: false },
        }),
        // 2. Update the target address
        prisma.address.update({
          where: { id: addressId },
          data: {
            label,
            street,
            city,
            state,
            country,
            postalCode,
            isDefault: true,
          },
        }),
      ]);
      return res.status(200).json(updatedAddress);
    }

    // Standard update if not changing the default status
    const updatedAddress = await prisma.address.update({
      where: { id: addressId, userId }, // Ensures user can only update their own address
      data: { label, street, city, state, country, postalCode },
    });

    res.status(200).json(updatedAddress);
  } catch (error) {
    res.status(500).json({ error: "Failed to update address." });
  }
};

/**
 * @description Delete an address
 * @route DELETE /api/addresses/:id
 * @access Private
 */
export const deleteAddress = async (
  req: Request,
  res: Response
): Promise<any> => {
  const userId = req.user?.id;
  const { id: addressId }: any = req.params;

  try {
    // Using deleteMany ensures the user can only delete their own address
    const deleteResult = await prisma.address.deleteMany({
      where: {
        id: addressId,
        userId: userId,
      },
    });

    if (deleteResult.count === 0) {
      return res.status(404).json({
        error: "Address not found or you do not have permission to delete it.",
      });
    }

    res.status(200).json({ message: "Address deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete address." });
  }
};
