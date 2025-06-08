import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "../../config/database";
import { JWT_SECRET, NODE_ENV } from "../../utils/secrets";
import bcrypt from "bcrypt";
import { createAccountType } from "../../types/adminTypes";

const createAccount = async (
  req: Request<{}, {}, createAccountType>,
  res: Response
): Promise<any> => {
  const userId = req.user?.id; // const {id} = req.user

  console.log(userId, "middleware");

  try {
    const { username, email, password, confirmPassword, role } = req.body;

    if (password !== confirmPassword) {
      res.status(400).json({ error: "Passwords do not match" });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log(role, "role");
    if (!role) {
      res.status(400).json({ error: "Role is required" });
      return;
    }
    if (!["ADMIN", "EMPLOYER", "USER"].includes(role)) {
      res.status(400).json({ error: "Invalid role" });
      return;
    }

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role,
      },
    });

    // console.log(user, "check");

    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      {
        expiresIn: "1d", //7
      }
    );

    res.cookie("access_", accessToken, {
      httpOnly: true,
      secure: NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      sameSite: "strict",
    });

    res.status(201).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    console.log(error);
    if (error.code === "P2002") {
      res.status(400).json({
        error: "User with this email or username already exists",
      });
      return;
    }
    res.status(400).json({ error: error.message });
  }
};

// const getAccount = async (req: Request, res: Response): Promise<any> => {
//   const userId = req.user?.id; // const {id} = req.user

//   console.log(userId, "middleware");

//   try {
//     res.status(201).json({ mesg: "success" });
//   } catch (error) {}
// };

const getAccounts = async (req: Request, res: Response): Promise<any> => {
  const userId = req.user?.id;
  const userRole = req.user?.role;

  console.log(userId, userRole, "middleware");

  try {
    const accounts = await prisma.user.findMany();
    console.log(accounts);
    res.status(200).json(accounts);
  } catch (error) {
    res.status(400).json(error);
  }
};

// Define a type for the response
interface UpdateAccountResponse {
  message: string;
  user?: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
}

// Define a type for the request body
interface UpdateAccountBody {
  username?: string;
  email?: string;
  role?: "ADMIN" | "EMPLOYER" | "USER";
  // Add other fields as needed, but avoid sensitive fields like password or role
}

const updateAccount = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id; // Admin or user ID from middleware
    const userRole = req.user?.role; // Role from middleware
    const { id: accountId } = req.params; // Extract accountId from params
    const { username, email, role } = req.body as UpdateAccountBody; // Extract fields to update

    // Validate input
    if (!accountId) {
      res.status(400).json({ message: "Account ID is required" });
      return;
    }

    if (!username && !email && !role) {
      res.status(400).json({
        message: "At least one field (username or email) must be provided",
      });
      return;
    }

    // Authorization check
    if (userRole !== "ADMIN" && userId !== accountId) {
      res.status(403).json({ message: "Unauthorized to update this account" });
      return;
    }

    // Prepare update data, only including provided fields
    const updateData: UpdateAccountBody = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (role) updateData.role = role;

    // Perform the update
    const updatedUser = await prisma.user.update({
      where: { id: accountId },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
      },
    });

    // Send response
    res.status(200).json({
      message: "Account updated successfully",
      user: updatedUser,
    } as UpdateAccountResponse);
  } catch (error) {
    console.error("Error updating account:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Define a type for the response
interface DeleteAccountResponse {
  message: string;
}

const deleteAccount = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id; // Admin or user ID from middleware
    const userRole = req.user?.role; // Role from middleware
    const { id: accountId } = req.params; // Extract accountId from params

    // Validate input
    if (!accountId) {
      res.status(400).json({ message: "Account ID is required" });
      return;
    }

    // Authorization check
    if (userRole !== "ADMIN" && userId !== accountId) {
      res.status(403).json({ message: "Unauthorized to delete this account" });
      return;
    }

    // Check if the user exists
    const user = await prisma.user.findUnique({
      where: { id: accountId },
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Perform the deletion
    await prisma.user.delete({
      where: { id: accountId },
    });

    // Send response
    res.status(200).json({
      message: "Account deleted successfully",
    } as DeleteAccountResponse);
  } catch (error) {
    console.error("Error deleting account:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const createProduct = async (req: Request, res: Response): Promise<any> => {
  const userId = req.user?.id; // const {id} = req.user

  console.log(userId, "middleware");

  try {
    res.status(201).json({ mesg: "success" });
  } catch (error) {}
};
const getProducts = async (req: Request, res: Response): Promise<any> => {
  const userId = req.user?.id; // const {id} = req.user

  console.log(userId, "middleware");

  try {
    res.status(201).json({ mesg: "success" });
  } catch (error) {}
};

const getProductById = async (req: Request, res: Response): Promise<any> => {
  const userId = req.user?.id; // const {id} = req.user

  console.log(userId, "middleware");

  try {
    res.status(201).json({ mesg: "success" });
  } catch (error) {}
};

const updateProduct = async (req: Request, res: Response): Promise<any> => {
  const userId = req.user?.id; // const {id} = req.user

  console.log(userId, "middleware");

  try {
    res.status(201).json({ mesg: "success" });
  } catch (error) {}
};

const deleteProduct = async (req: Request, res: Response): Promise<any> => {
  const userId = req.user?.id; // const {id} = req.user

  console.log(userId, "middleware");

  try {
    res.status(201).json({ mesg: "success" });
  } catch (error) {}
};

const getCart = async (req: Request, res: Response): Promise<any> => {
  const userId = req.user?.id; // const {id} = req.user

  console.log(userId, "middleware");

  try {
    res.status(201).json({ mesg: "success" });
  } catch (error) {}
};

const updateCart = async (req: Request, res: Response): Promise<any> => {
  const userId = req.user?.id; // const {id} = req.user

  console.log(userId, "middleware");

  try {
    res.status(201).json({ mesg: "success" });
  } catch (error) {}
};

const deleteCart = async (req: Request, res: Response): Promise<any> => {
  const userId = req.user?.id; // const {id} = req.user

  console.log(userId, "middleware");

  try {
    res.status(201).json({ mesg: "success" });
  } catch (error) {}
};

const getOrder = async (req: Request, res: Response): Promise<any> => {
  const userId = req.user?.id; // const {id} = req.user

  console.log(userId, "middleware");

  try {
    res.status(201).json({ mesg: "success" });
  } catch (error) {}
};

const updateOrder = async (req: Request, res: Response): Promise<any> => {
  const userId = req.user?.id; // const {id} = req.user

  console.log(userId, "middleware");

  try {
    res.status(201).json({ mesg: "success" });
  } catch (error) {}
};

const deleteOrder = async (req: Request, res: Response): Promise<any> => {
  const userId = req.user?.id; // const {id} = req.user

  console.log(userId, "middleware");

  try {
    res.status(201).json({ mesg: "success" });
  } catch (error) {}
};

export {
  createAccount,
  getAccounts,
  updateAccount,
  deleteAccount,
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getCart,
  updateCart,
  deleteCart,
  getOrder,
  updateOrder,
  deleteOrder,
};
