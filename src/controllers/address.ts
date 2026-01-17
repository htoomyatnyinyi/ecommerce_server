import { Request, Response } from "express";
import prisma from "../config/database";
import { successResponse, errorResponse } from "../utils/response";

export const getAddresses = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const userId = req.user?.id;
    if (!userId) return errorResponse(res, "Unauthorized", 401);

    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return successResponse(res, addresses, "Addresses fetched successfully");
  } catch (error) {
    return errorResponse(res, "Failed to retrieve addresses", 500, error);
  }
};

export const createAddress = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const userId = req.user?.id;
    if (!userId) return errorResponse(res, "Unauthorized", 401);

    const { label, street, city, state, country, postalCode, isDefault } =
      req.body;

    if (!street || !city || !country || !postalCode) {
      return errorResponse(res, "Missing required address fields", 400);
    }

    if (isDefault) {
      const [_, newAddress] = await prisma.$transaction([
        prisma.address.updateMany({
          where: { userId },
          data: { isDefault: false },
        }),
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
      return successResponse(
        res,
        newAddress,
        "Address created successfully",
        201
      );
    }

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
    return successResponse(
      res,
      newAddress,
      "Address created successfully",
      201
    );
  } catch (error) {
    return errorResponse(res, "Failed to create address", 500, error);
  }
};

export const updateAddress = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const userId = req.user?.id;
    if (!userId) return errorResponse(res, "Unauthorized", 401);

    const addressId = req.params.id as string;
    const { label, street, city, state, country, postalCode, isDefault } =
      req.body;

    if (isDefault) {
      const [_, updatedAddress] = await prisma.$transaction([
        prisma.address.updateMany({
          where: { userId, NOT: { id: addressId } },
          data: { isDefault: false },
        }),
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
      return successResponse(
        res,
        updatedAddress,
        "Address updated successfully"
      );
    }

    const updatedAddress = await prisma.address.update({
      where: { id: addressId, userId },
      data: { label, street, city, state, country, postalCode },
    });

    return successResponse(res, updatedAddress, "Address updated successfully");
  } catch (error) {
    return errorResponse(res, "Failed to update address", 500, error);
  }
};

export const deleteAddress = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const userId = req.user?.id;
    if (!userId) return errorResponse(res, "Unauthorized", 401);

    const addressId = req.params.id as string;

    const deleteResult = await prisma.address.deleteMany({
      where: { id: addressId, userId },
    });

    if (deleteResult.count === 0) {
      return errorResponse(res, "Address not found or permission denied", 404);
    }

    return successResponse(res, null, "Address deleted successfully");
  } catch (error) {
    return errorResponse(res, "Failed to delete address", 500, error);
  }
};
