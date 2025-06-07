import { Request, Response, NextFunction } from "express";
import prisma from "../config/database";

export const isEmailVerified = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user?.id },
    });

    if (!user) {
      res.status(401).json({ message: "User not found" });
      return;
    }

    if (!user.isEmailVerified) {
      res
        .status(403)
        .json({ message: "Please verify your email before proceeding" });
      return;
    }

    next();
  } catch (error) {
    console.error("Error checking email verification:", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
};

// // it usage
// app.put("/users/:id", requireEmailVerification, updateAccount);
// app.delete("/users/:id", requireEmailVerification, deleteAccount);
