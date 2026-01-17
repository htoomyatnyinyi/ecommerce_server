import { Request, Response } from "express";
import prisma from "../config/database";
import bcrypt from "bcrypt";
import { successResponse, errorResponse } from "../utils/response";

export const updateProfile = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { username } = req.body;
    const userId = req.user?.id;

    if (!userId) return errorResponse(res, "Unauthorized", 401);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { username },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return successResponse(res, updatedUser, "Profile updated successfully");
  } catch (error: any) {
    if (error.code === "P2002") {
      return errorResponse(res, "Username already taken", 400);
    }
    return errorResponse(res, "Internal server error", 500, error);
  }
};

export const updatePassword = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user?.id;

    if (!userId) return errorResponse(res, "Unauthorized", 401);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.password)
      return errorResponse(res, "User not found", 404);

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return errorResponse(res, "Incorrect current password", 400);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return successResponse(res, null, "Password updated successfully");
  } catch (error) {
    return errorResponse(res, "Internal server error", 500, error);
  }
};

export const savePushToken = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { token } = req.body;
    const userId = req.user?.id;

    if (!userId) return errorResponse(res, "Unauthorized", 401);
    if (!token) return errorResponse(res, "Token is required", 400);

    const existingToken = await prisma.pushToken.findUnique({
      where: { token },
    });

    if (existingToken) {
      if (existingToken.userId === userId) {
        return successResponse(res, existingToken, "Token already registered");
      } else {
        const updatedToken = await prisma.pushToken.update({
          where: { token },
          data: { userId },
        });
        return successResponse(
          res,
          updatedToken,
          "Token transferred to current user"
        );
      }
    }

    const newToken = await prisma.pushToken.create({
      data: { token, userId },
    });

    return successResponse(res, newToken, "Token saved successfully", 201);
  } catch (error) {
    return errorResponse(res, "Internal server error", 500, error);
  }
};
