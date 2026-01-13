"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.permission = exports.authenticated = void 0;
const secrets_1 = require("../utils/secrets");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticated = async (req, res, next) => {
    const access_cookies = req.cookies;
    const accessToken = access_cookies.access_id;
    // console.log("authenticated - Cookies received:", req.cookies);
    if (!accessToken) {
        return await handleRefreshToken(req, res, next);
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(accessToken, secrets_1.JWT_SECRET);
        // console.log("Token decoded successfully:", decoded);
        req.user = decoded; // ceck later
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            return await handleRefreshToken(req, res, next);
        }
        res.status(401).json({
            message: "Authentication failed",
            error: "Invalid token",
        });
    }
};
exports.authenticated = authenticated;
const handleRefreshToken = async (req, res, next) => {
    const cookies = req.cookies;
    const refreshToken = cookies.refresh_id;
    console.log("WHEN handleRefreshToken - Cookies received:", req.cookies);
    if (!refreshToken) {
        res.status(401).json({
            message: "Authentication required at refreshCookiesToken",
            error: "No refresh token provided",
        });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(refreshToken, secrets_1.JWT_REFRESH_SECRET);
        const newAccessToken = jsonwebtoken_1.default.sign({ id: decoded.id, email: decoded.email, role: decoded.role }, secrets_1.JWT_SECRET, { expiresIn: "15m" } // 15m
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
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            res.status(401).json({
                message: "Authentication failed",
                error: "Refresh token expired",
            });
        }
        else {
            res.status(401).json({
                message: "Authentication failed",
                error: "Invalid refresh token",
            });
        }
    }
};
// Role checking middleware (factory function)
const permission = (roles) => {
    return (req, res, next) => {
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
exports.permission = permission;
