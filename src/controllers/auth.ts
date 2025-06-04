import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../config/database";
import {
  UserSignInRequest,
  UserSignUpRequest,
  AuthMe,
} from "../types/authTypes";

const JWT_SECRET = process.env.JWT_SECRET || "htoomyat";
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

// interface RegisterFormBody {
//   username: string;
//   email: string;
//   password: string;
//   confirmPassword: string;
//   role: string;
// }

// interface UserSignInRequest {
//   email: string;
//   password: string;
// }

export const signup = async (
  req: Request<{}, {}, UserSignUpRequest>,
  // req: Request<{}, {}, RegisterFormBody>,
  res: Response
): Promise<any> => {
  try {
    const { username, email, password, confirmPassword, role } = req.body;

    if (password !== confirmPassword) {
      res.status(400).json({ error: "Passwords do not match" });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    // console.log(user, "check");

    const jwt_token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      {
        expiresIn: "1d", //7
      }
    );

    res.cookie("jwt_token", jwt_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: COOKIE_MAX_AGE,
      sameSite: "strict",
    });

    res.status(201).json({
      jwt_token,
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

export const signin = async (
  req: Request<{}, {}, UserSignInRequest>,
  res: Response
): Promise<any> => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(400).json({
        error: "Invalid credentials",
        message: "Your Email Haven't Register Yet.",
      });
      return;
    }
    // console.log(user);

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      res.status(400).json({
        error: "Invalid credentials",
        message: "Please Check Your Password",
      });
      return;
    }

    const jwt_token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      {
        expiresIn: "1d", // 7d
      }
    );

    res.cookie("e_hmnn", jwt_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: COOKIE_MAX_AGE,
      sameSite: "strict",
    });

    res.status(200).json({
      jwt_token,
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
    res.status(400).json({ error: error.message });
  }
};

export const authMe = async (
  req: Request<{}, AuthMe>,
  res: Response<{}, AuthMe>
): Promise<void> => {
  const user = req.user;
  console.log(user);

  try {
    res.json(user);
  } catch (error: any) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// export const me = async (req: Request, res: Response): Promise<any> => {
//   res.status(200).json({ message: "HI FrOM Me No Verify Cookies" });
// };

export const signout = (req: Request, res: Response) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    // secure: true,
    secure: process.env.NODE_ENV === "production",
    // sameSite: "None", // "Lax"
    sameSite: "strict",
    path: "/",
  });

  res.clearCookie("refreshToken", {
    httpOnly: true,
    // secure: true,
    secure: process.env.NODE_ENV === "production",
    // sameSite: "None", // "Lax"
    sameSite: "strict",
    path: "/",
  });

  res.json({ message: "Logged out successfully" });
};
