import { Request, Response } from "express";
import prisma from "../config/database";
import bcrypt from "bcrypt";

export const updateProfile = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { username } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        username,
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    res.json(updatedUser);
  } catch (error: any) {
    if (error.code === "P2002") {
      return res.status(400).json({ message: "Username already taken" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updatePassword = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.password) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect current password" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
    });

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Update password error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
