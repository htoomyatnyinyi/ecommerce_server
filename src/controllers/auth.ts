import { Request, Response } from "express";
import prisma from "../config/database";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { transporter } from "../utils/mailTransporter";
import { oauth2Client } from "../utils/googleOauth";
import { successResponse, errorResponse } from "../utils/response";
import {
  EMAIL_USER,
  FRONTEND_URL,
  JWT_REFRESH_SECRET,
  JWT_SECRET,
  NODE_ENV,
} from "../utils/secrets";

import { SignInRequest, SignUpRequest } from "../types/authTypes";

export const googleAuth = async (req: Request, res: Response): Promise<any> => {
  try {
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: [
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
      ],
    });
    return successResponse(res, { authUrl });
  } catch (error) {
    return errorResponse(res, "Error generating Google auth URL", 500, error);
  }
};

export const signup = async (
  req: Request<{}, {}, SignUpRequest>,
  res: Response
): Promise<any> => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return errorResponse(res, "Passwords do not match", 400);
    }

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (existingUser) {
      return errorResponse(res, "Username or email already exists", 400);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        isEmailVerified: false,
      },
    });

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 3600000);

    try {
      await prisma.emailVerificationToken.create({
        data: {
          token,
          userId: user.id,
          expiresAt,
        },
      });
    } catch (dbError) {
      await prisma.user.delete({ where: { id: user.id } });
      return errorResponse(
        res,
        "Failed to store verification token",
        500,
        dbError
      );
    }

    const verifyUrl = `${FRONTEND_URL}/verify-email?token=${token}`;
    const mailOptions = {
      from: EMAIL_USER,
      to: email,
      subject: "Verify Your Email Address",
      text: `Click this link to verify your email: ${verifyUrl}\nThis link expires in 24 hours.`,
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      await prisma.emailVerificationToken.deleteMany({
        where: { userId: user.id },
      });
      await prisma.user.delete({ where: { id: user.id } });
      return errorResponse(
        res,
        "Failed to send verification email",
        500,
        emailError
      );
    }

    return successResponse(
      res,
      null,
      "Signup successful. Please check your email to verify your account.",
      201
    );
  } catch (error) {
    return errorResponse(res, "Signup failed", 400, error);
  }
};

export const verifyEmail = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { token } = req.body;

    if (!token || typeof token !== "string") {
      return errorResponse(res, "Verification token is required", 400);
    }

    const verificationToken = await prisma.emailVerificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verificationToken) {
      return errorResponse(res, "Invalid or expired token", 400);
    }

    if (verificationToken.expiresAt < new Date()) {
      await prisma.emailVerificationToken.delete({
        where: { id: verificationToken.id },
      });
      return errorResponse(res, "Invalid or expired token", 400);
    }

    await prisma.user.update({
      where: { id: verificationToken.userId },
      data: { isEmailVerified: true },
    });

    await prisma.emailVerificationToken.delete({
      where: { id: verificationToken.id },
    });

    return successResponse(res, null, "Email verified successfully");
  } catch (error) {
    return errorResponse(res, "Internal server error", 500, error);
  }
};

export const signin = async (
  req: Request<{}, {}, SignInRequest>,
  res: Response
): Promise<any> => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.password) {
      return errorResponse(
        res,
        "Invalid credentials",
        400,
        "Your Email Haven't Register Yet."
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return errorResponse(
        res,
        "Invalid credentials",
        400,
        "Please Check Your Password"
      );
    }

    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("access_id", accessToken, {
      httpOnly: true,
      secure: NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
      path: "/",
      sameSite: "lax",
    });

    res.cookie("refresh_id", refreshToken, {
      httpOnly: true,
      secure: NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 7,
      path: "/",
      sameSite: "lax",
    });

    return successResponse(res, {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    return errorResponse(res, "Signin failed", 400, error);
  }
};

export const authMe = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return errorResponse(res, "Unauthorized", 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        isEmailVerified: true,
      },
    });

    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    return successResponse(res, user);
  } catch (error: any) {
    return errorResponse(res, "Server error", 500, error);
  }
};

export const signout = (req: Request, res: Response): any => {
  res.clearCookie("access_id", {
    httpOnly: true,
    secure: NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });

  res.clearCookie("refresh_id", {
    httpOnly: true,
    secure: NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });

  return successResponse(res, null, "Logged out successfully");
};

export const requestPasswordReset = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { email } = req.body;

    if (!email) {
      return errorResponse(res, "Email is required", 400);
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return successResponse(
        res,
        null,
        "If the email exists, a reset link has been sent"
      );
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 3600000);

    try {
      await prisma.passwordResetToken.create({
        data: {
          token,
          userId: user.id,
          expiresAt,
        },
      });
    } catch (dbError) {
      return errorResponse(res, "Failed to store reset token", 500, dbError);
    }

    const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}`;
    const mailOptions = {
      from: EMAIL_USER,
      to: email,
      subject: "Password Reset Request",
      text: `Click this link to reset your password: ${resetUrl}\nThis link expires in 1 hour.`,
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      return errorResponse(res, "Failed to send reset email", 500, emailError);
    }

    return successResponse(
      res,
      null,
      "If the email exists, a reset link has been sent"
    );
  } catch (error) {
    return errorResponse(res, "Internal server error", 500, error);
  }
};

export const resetPassword = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return errorResponse(res, "Token and new password are required", 400);
    }

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken) {
      return errorResponse(res, "Invalid or expired token", 400);
    }

    if (resetToken.expiresAt < new Date()) {
      await prisma.passwordResetToken.delete({ where: { id: resetToken.id } });
      return errorResponse(res, "Invalid or expired token", 400);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword },
    });

    await prisma.passwordResetToken.delete({ where: { id: resetToken.id } });

    return successResponse(res, null, "Password reset successfully");
  } catch (error) {
    return errorResponse(res, "Internal server error", 500, error);
  }
};
