"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
// Generate verification token
const token = crypto_1.default.randomBytes(32).toString("hex");
const expiresAt = new Date(Date.now() + 24 * 3600000); // 24-hour expiration
// export { token, expiresAt };
//
