"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestPasswordReset = exports.signout = exports.authMe = exports.signin = exports.resetPassword = exports.verifyEmail = exports.signup = exports.googleAuth = void 0;
const database_1 = __importDefault(require("../config/database"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const mailTransporter_1 = require("../utils/mailTransporter");
const googleOauth_1 = require("../utils/googleOauth");
const secrets_1 = require("../utils/secrets");
const googleAuth = async (req, res) => {
    try {
        const authUrl = googleOauth_1.oauth2Client.generateAuthUrl({
            access_type: "offline",
            scope: [
                "https://www.googleapis.com/auth/userinfo.email",
                "https://www.googleapis.com/auth/userinfo.profile",
            ],
        });
        res.redirect(authUrl);
    }
    catch (error) {
        console.error("Error generating Google auth URL:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.googleAuth = googleAuth;
const signup = async (req, res) => {
    try {
        const { username, email, password, confirmPassword, role } = req.body;
        if (password !== confirmPassword) {
            res.status(400).json({ error: "Passwords do not match" });
            return;
        }
        // Check if user already exists
        const existingUser = await database_1.default.user.findFirst({
            where: { OR: [{ email }, { username }] },
        });
        if (existingUser) {
            res
                .status(400)
                .json({ message: "Username or email already exists at databaes " });
            return;
        }
        const salt = await bcrypt_1.default.genSalt(10);
        const hashedPassword = await bcrypt_1.default.hash(password, salt);
        const user = await database_1.default.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
                role,
                isEmailVerified: false,
            },
        });
        // Generate verification token
        const token = crypto_1.default.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 24 * 3600000); // 24-hour expiration
        // Store token in database
        try {
            const verificationToken = await database_1.default.emailVerificationToken.create({
                data: {
                    token,
                    userId: user.id,
                    expiresAt,
                },
            });
            console.log("Created verification token:", verificationToken); // Debug log
        }
        catch (dbError) {
            console.error("Failed to store verification token:", dbError);
            // Optionally delete the user if token storage fails
            await database_1.default.user.delete({ where: { id: user.id } });
            res.status(500).json({ message: "Failed to store verification token" });
            return;
        }
        // Send verification email
        const verifyUrl = `${secrets_1.FRONTEND_URL}/verify-email?token=${token}`;
        const mailOptions = {
            from: secrets_1.EMAIL_USER,
            to: email,
            subject: "Verify Your Email Address",
            text: `Click this link to verify your email: ${verifyUrl}\nThis link expires in 24 hours.`,
        };
        try {
            await mailTransporter_1.transporter.sendMail(mailOptions);
        }
        catch (emailError) {
            console.error("Failed to send verification email:", emailError);
            // Optionally delete user and token if email fails
            await database_1.default.emailVerificationToken.deleteMany({
                where: { userId: user.id },
            });
            await database_1.default.user.delete({ where: { id: user.id } });
            res.status(500).json({ message: "Failed to send verification email" });
            return;
        }
        res.status(201).json({
            message: "Signup successful. Please check your email to verify your account.",
        });
    }
    catch (error) {
        console.log(error);
        res.status(400).json({ error: error.message });
    }
};
exports.signup = signup;
const verifyEmail = async (req, res) => {
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
        const verificationToken = await database_1.default.emailVerificationToken.findUnique({
            where: { token },
            include: { user: true },
        });
        if (!verificationToken) {
            res.status(400).json({ message: "Invalid or expired token" });
            return;
        }
        // Check expiration
        if (verificationToken.expiresAt < new Date()) {
            await database_1.default.emailVerificationToken.delete({
                where: { id: verificationToken.id },
            });
            res.status(400).json({ message: "Invalid or expired token" });
            return;
        }
        // Update user's email verification status
        await database_1.default.user.update({
            where: { id: verificationToken.userId },
            data: { isEmailVerified: true }, // later change isEmailVerified
        });
        // Delete used token
        await database_1.default.emailVerificationToken.delete({
            where: { id: verificationToken.id },
        });
        res.status(200).json({ message: "Email verified successfully" });
    }
    catch (error) {
        console.error("Error verifying email:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.verifyEmail = verifyEmail;
// #### START EDIT HERER
const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) {
            res.status(400).json({ message: "Token and new password are required" });
            return;
        }
        // const resetToken = await findPasswordResetToken(token);
        const resetToken = await database_1.default.passwordResetToken.findUnique({
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
            await database_1.default.passwordResetToken.delete({ where: { id: resetToken.id } });
            //
            res.status(400).json({ message: "Invalid or expired token" });
            return;
        }
        const hashedPassword = await bcrypt_1.default.hash(newPassword, 10);
        // await updateUser(resetToken.userId, { password: hashedPassword });
        await database_1.default.user.update({
            where: { id: resetToken.userId },
            data: { password: hashedPassword },
        });
        //
        // await deletePasswordResetToken(resetToken.id);
        await database_1.default.passwordResetToken.delete({ where: { id: resetToken.id } });
        //
        res.status(200).json({
            message: "Password reset successfully",
        });
    }
    catch (error) {
        console.error("Error resetting password:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.resetPassword = resetPassword;
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
const signin = async (req, res) => {
    try {
        console.log(secrets_1.NODE_ENV, "NODE_ENV at signin");
        const { email, password } = req.body;
        const user = await database_1.default.user.findUnique({
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
        const isMatch = await bcrypt_1.default.compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({
                error: "Invalid credentials",
                message: "Please Check Your Password",
            });
            return;
        }
        const accessToken = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, secrets_1.JWT_SECRET, {
            expiresIn: "15m", // 7d
        });
        const refreshToken = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, secrets_1.JWT_REFRESH_SECRET, { expiresIn: "7d" });
        res.cookie("access_id", accessToken, {
            httpOnly: true,
            secure: secrets_1.NODE_ENV === "production",
            maxAge: 24 * 60 * 60 * 1000, // 15 minutes
            path: "/",
            sameSite: "lax",
            // | Environment        | `secure` | `sameSite` | `credentials` on client  |
            // | ------------------ | -------- | ---------- | ------------------------ |
            // | Production (HTTPS) | `true`   | `"none"`   | `credentials: "include"` |
            // | Development (HTTP) | `false`  | `"lax"`    | `credentials: "include"` |
        });
        res.cookie("refresh_id", refreshToken, {
            httpOnly: true,
            secure: secrets_1.NODE_ENV === "production",
            maxAge: 1000 * 60 * 60 * 24 * 7,
            path: "/",
            sameSite: "lax", // "Lax"÷
            // | Environment        | `secure` | `sameSite` | `credentials` on client  |
            // | ------------------ | -------- | ---------- | ------------------------ |
            // | Production (HTTPS) | `true`   | `"none"`   | `credentials: "include"` |
            // | Development (HTTP) | `false`  | `"lax"`    | `credentials: "include"` |
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
    }
    catch (error) {
        console.log(error);
        res.status(400).json({ error: error.message });
    }
};
exports.signin = signin;
const authMe = async (req, res) => {
    const user = req.user;
    console.log(user);
    try {
        res.json(user);
    }
    catch (error) {
        res
            .status(500)
            .json({ success: false, message: "Server error", error: error.message });
    }
};
exports.authMe = authMe;
const signout = (req, res) => {
    res.clearCookie("access_id", {
        httpOnly: true,
        secure: secrets_1.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 0, // Clear cookie immediately
        path: "/",
        // | Environment        | `secure` | `sameSite` | `credentials` on client  |
        // | ------------------ | -------- | ---------- | ------------------------ |
        // | Production (HTTPS) | `true`   | `"none"`   | `credentials: "include"` |
        // | Development (HTTP) | `false`  | `"lax"`    | `credentials: "include"` |
    });
    res.clearCookie("refresh_id", {
        httpOnly: true,
        secure: secrets_1.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 0, // Clear cookie immediately
        path: "/",
        // | Environment        | `secure` | `sameSite` | `credentials` on client  |
        // | ------------------ | -------- | ---------- | ------------------------ |
        // | Production (HTTPS) | `true`   | `"none"`   | `credentials: "include"` |
        // | Development (HTTP) | `false`  | `"lax"`    | `credentials: "include"` |
    });
    res.json({ message: "Logged out successfully" });
};
exports.signout = signout;
const requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;
        // Validate input
        if (!email) {
            res.status(400).json({ message: "Email is required" });
            return;
        }
        // Find user by email
        const user = await database_1.default.user.findUnique({
            where: { email },
        });
        if (!user) {
            res
                .status(200)
                .json({ message: "If the email exists, a reset link has been sent" });
            return;
        }
        // Generate reset token
        const token = crypto_1.default.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 3600000); // 1 hour expiration
        // Store token in database
        try {
            const resetToken = await database_1.default.passwordResetToken.create({
                data: {
                    token,
                    userId: user.id,
                    expiresAt,
                },
            });
            console.log("Created reset token:", resetToken); // Debug log
        }
        catch (dbError) {
            console.error("Failed to store reset token:", dbError);
            res.status(500).json({ message: "Failed to store reset token" });
            return;
        }
        // Send reset email
        const resetUrl = `${secrets_1.FRONTEND_URL}/reset-password?token=${token}`;
        const mailOptions = {
            from: secrets_1.EMAIL_USER,
            to: email,
            subject: "Password Reset Request FROM HMNN",
            text: `Click this link to reset your password: ${resetUrl}\nThis link expires in 1 hour.`,
        };
        try {
            await mailTransporter_1.transporter.sendMail(mailOptions);
        }
        catch (emailError) {
            console.error("Failed to send email:", emailError);
            res.status(500).json({ message: "Failed to send reset email" });
            return;
        }
        res
            .status(200)
            .json({ message: "If the email exists, a reset link has been sent" });
    }
    catch (error) {
        console.error("Error requesting password reset:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.requestPasswordReset = requestPasswordReset;
