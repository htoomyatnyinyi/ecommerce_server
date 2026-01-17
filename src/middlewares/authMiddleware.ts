import { NextFunction, Request, Response } from "express";
import { JWT_REFRESH_SECRET, JWT_SECRET } from "../utils/secrets";
import jwt from "jsonwebtoken";

// Type definitions
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

interface JwtPayload {
  id: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

interface AuthCookies {
  access_id?: string; // accessToken
  refresh_id?: string; // no need
}

const authenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const access_cookies = req.cookies as AuthCookies;
  const accessToken = access_cookies.access_id;

  // console.log("authenticated - Cookies received:", req.cookies);

  if (!accessToken) {
    return await handleRefreshToken(req, res, next);
  }

  try {
    const decoded = jwt.verify(accessToken, JWT_SECRET) as JwtPayload;
    // console.log("Token decoded successfully:", decoded);

    req.user = decoded; // ceck later

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return await handleRefreshToken(req, res, next);
    }
    res.status(401).json({
      message: "Authentication failed",
      error: "Invalid token",
    });
  }
};

const handleRefreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const cookies = req.cookies as AuthCookies;
  const refreshToken = cookies.refresh_id;

  // console.log("WHEN handleRefreshToken - Cookies received:", req.cookies);

  if (!refreshToken) {
    res.status(401).json({
      message: "Authentication required at refreshCookiesToken",
      error: "No refresh token provided",
    });
    return;
  }

  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as JwtPayload;
    const newAccessToken = jwt.sign(
      { id: decoded.id, email: decoded.email, role: decoded.role },
      JWT_SECRET,
      { expiresIn: "15m" } // 15m
    );

    res.cookie("access_id", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax", // false for lax
      path: "/",
      maxAge: 24 * 60 * 60 * 1000, // 15 minutes
      // | Environment        | `secure` | `sameSite` | `credentials` on client  |
      // | ------------------ | -------- | ---------- | ------------------------ |
      // | Production (HTTPS) | `true`   | `"none"`   | `credentials: "include"` |
      // | Development (HTTP) | `false`  | `"lax"`    | `credentials: "include"` |
    });

    req.user = decoded; // later check
    // console.log(decoded, " check doecode new access token");
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        message: "Authentication failed",
        error: "Refresh token expired",
      });
    } else {
      res.status(401).json({
        message: "Authentication failed",
        error: "Invalid refresh token",
      });
    }
  }
};

// Role checking middleware (factory function)
const permission = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !req.user.role || !roles.includes(req.user.role)) {
      res.status(403).json({
        message: "Insufficient permissions",
        error: "Role not authorized",
      });
      return;
    }
    next();
  };
};

// how to usage
// // Protect a route
// router.get('/protected', authenticated, (req, res) => {
//   res.json({ message: 'Access granted', user: req.user });
// });

// // Admin-only route
// router.get('/admin', authenticated, permission(['ADMIN']), (req, res) => {
//   res.json({ message: 'Admin access granted' });
// });

export { authenticated, permission };
