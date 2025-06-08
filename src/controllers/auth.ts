import { Request, Response } from "express";
import prisma from "../config/database";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import { transporter } from "../utils/mailTransporter";
import { oauth2Client } from "../utils/googleOauth";

import {
  COOKIE_MAX_AGE,
  EMAIL_USER,
  FRONTEND_URL,
  JWT_REFRESH_SECRET,
  JWT_SECRET,
  NODE_ENV,
} from "../utils/secrets";

import {
  SignInRequest,
  SignUpRequest,
  AuthMe,
  AuthMeResponse,
} from "../types/authTypes";

export const googleAuth = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: [
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
      ],
    });
    res.redirect(authUrl);
  } catch (error) {
    console.error("Error generating Google auth URL:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const signup = async (
  req: Request<{}, {}, SignUpRequest>,
  res: Response
): Promise<any> => {
  try {
    const { username, email, password, confirmPassword, role } = req.body;

    if (password !== confirmPassword) {
      res.status(400).json({ error: "Passwords do not match" });
      return;
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (existingUser) {
      res
        .status(400)
        .json({ message: "Username or email already exists at databaes " });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role,
        isEmailVerified: false,
      },
    });

    // Generate verification token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 3600000); // 24-hour expiration

    // Store token in database
    try {
      const verificationToken = await prisma.emailVerificationToken.create({
        data: {
          token,
          userId: user.id,
          expiresAt,
        },
      });
      console.log("Created verification token:", verificationToken); // Debug log
    } catch (dbError) {
      console.error("Failed to store verification token:", dbError);
      // Optionally delete the user if token storage fails
      await prisma.user.delete({ where: { id: user.id } });
      res.status(500).json({ message: "Failed to store verification token" });
      return;
    }

    // Send verification email
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
      console.error("Failed to send verification email:", emailError);
      // Optionally delete user and token if email fails
      await prisma.emailVerificationToken.deleteMany({
        where: { userId: user.id },
      });
      await prisma.user.delete({ where: { id: user.id } });
      res.status(500).json({ message: "Failed to send verification email" });
      return;
    }

    res.status(201).json({
      message:
        "Signup successful. Please check your email to verify your account.",
    });
  } catch (error: any) {
    console.log(error);
    // if (error.code === "P2002") {
    //   res.status(400).json({
    //     error: "User with this email or username already exists",
    //   });
    //   return;
    // }
    res.status(400).json({ error: error.message });
  }
};

export const verifyEmail = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // const { token } = req.query;
    const { token } = req.body;
    console.log(token, " checked at atuh");
    // Validate input
    if (!token || typeof token !== "string") {
      res.status(400).json({ message: "Verification token is required" });
      return;
    }

    // Find verification token
    const verificationToken = await prisma.emailVerificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verificationToken) {
      res.status(400).json({ message: "Invalid or expired token" });
      return;
    }

    // Check expiration
    if (verificationToken.expiresAt < new Date()) {
      await prisma.emailVerificationToken.delete({
        where: { id: verificationToken.id },
      });
      res.status(400).json({ message: "Invalid or expired token" });
      return;
    }

    // Update user's email verification status
    await prisma.user.update({
      where: { id: verificationToken.userId },
      data: { isEmailVerified: true }, // later change isEmailVerified
    });

    // Delete used token
    await prisma.emailVerificationToken.delete({
      where: { id: verificationToken.id },
    });

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Error verifying email:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// #### START EDIT HERER
export const resetPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      res.status(400).json({ message: "Token and new password are required" });
      return;
    }

    // const resetToken = await findPasswordResetToken(token);
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });
    //

    if (!resetToken) {
      res.status(400).json({ message: "Invalid or expired token" });
      return;
    }

    if (resetToken.expiresAt < new Date()) {
      // await deletePasswordResetToken(resetToken.id);
      await prisma.passwordResetToken.delete({ where: { id: resetToken.id } });
      //
      res.status(400).json({ message: "Invalid or expired token" });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    // await updateUser(resetToken.userId, { password: hashedPassword });
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword },
    });
    //

    // await deletePasswordResetToken(resetToken.id);
    await prisma.passwordResetToken.delete({ where: { id: resetToken.id } });
    //

    res.status(200).json({
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// export const googleAuthCallback = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   try {
//     const { code } = req.query;
//     if (!code || typeof code !== "string") {
//       res.status(400).json({ message: "Authorization code is required" });
//       return;
//     }

//     const { tokens } = await oauth2Client.getToken(code);
//     oauth2Client.setCredentials(tokens);

//     const response = await oauth2Client.request({
//       url: "https://www.googleapis.com/oauth2/v3/userinfo",
//     });
//     const {
//       sub: googleId,
//       email,
//       name,
//     } = response.data as { sub: string; email: string; name: string };

//     let user = await findUserByGoogleId(googleId);
//     if (!user) {
//       user = await findUserByEmailOrUsername(email, email);
//       if (user) {
//         // Link existing account
//         user = await updateUser(user.id, { googleId });
//       } else {
//         // Create new user
//         user = await createUser({
//           username: name || `google_user_${googleId}`,
//           email,
//           googleId,
//         });
//       }
//     }

//     // For Google users, email is auto-verified
//     if (!user.isEmailVerified) {
//       await updateUser(user.id, { isEmailVerified: true });
//     }

//     // Redirect to frontend (or issue JWT token)
//     res.redirect(`${process.env.FRONTEND_URL}/dashboard?userId=${user.id}`);
//   } catch (error) {
//     console.error("Error in Google auth callback:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

// End Edit Heer

export const signin = async (
  req: Request<{}, {}, SignInRequest>,
  res: Response
): Promise<any> => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
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

    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      {
        expiresIn: "1d", // 7d
      }
    );

    const refreshToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("access_id", accessToken, {
      httpOnly: true,
      // secure: true,
      secure: false,
      // secure: NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24,
      path: "/",
      sameSite: "lax", // "Lax"÷
      // sameSite: "lax",
    });

    res.cookie("refresh_id", refreshToken, {
      httpOnly: true,
      // secure: NODE_ENV === "production",
      secure: false,
      maxAge: 1000 * 60 * 60 * 24 * 7,
      path: "/",
      sameSite: "lax", // "Lax"÷
      // sameSite: "lax",
    });

    res.status(200).json({
      // accessToken,
      // refreshToken,
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
  res: Response<{}, AuthMeResponse>
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

export const signout = (req: Request, res: Response) => {
  res.clearCookie("access_id", {
    httpOnly: true,
    secure: false,
    // secure: NODE_ENV === "production",
    // sameSite: "None", // "Lax"
    sameSite: "lax",
    // sameSite: "none",
    maxAge: 0, // Clear cookie immediately
    path: "/",
  });

  res.clearCookie("refresh_id", {
    httpOnly: true,
    // secure: true,
    secure: NODE_ENV === "production",
    // sameSite: "None", // "Lax"
    sameSite: "none",
    maxAge: 0, // Clear cookie immediately
    path: "/",
  });

  res.json({ message: "Logged out successfully" });
};

// Define response type
interface ResetPasswordRequestResponse {
  message: string;
}

export const requestPasswordReset = async (
  req: Request,
  res: Response<ResetPasswordRequestResponse>
): Promise<void> => {
  try {
    const { email } = req.body;

    // Validate input
    if (!email) {
      res.status(400).json({ message: "Email is required" });
      return;
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res
        .status(200)
        .json({ message: "If the email exists, a reset link has been sent" });
      return;
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour expiration

    // Store token in database
    try {
      const resetToken = await prisma.passwordResetToken.create({
        data: {
          token,
          userId: user.id,
          expiresAt,
        },
      });
      console.log("Created reset token:", resetToken); // Debug log
    } catch (dbError) {
      console.error("Failed to store reset token:", dbError);
      res.status(500).json({ message: "Failed to store reset token" });
      return;
    }

    // Send reset email
    const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}`;

    const mailOptions = {
      from: EMAIL_USER,
      to: email,
      subject: "Password Reset Request FROM HMNN",
      text: `Click this link to reset your password: ${resetUrl}\nThis link expires in 1 hour.`,
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error("Failed to send email:", emailError);
      res.status(500).json({ message: "Failed to send reset email" });
      return;
    }

    res
      .status(200)
      .json({ message: "If the email exists, a reset link has been sent" });
  } catch (error) {
    console.error("Error requesting password reset:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
