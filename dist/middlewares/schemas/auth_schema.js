"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth_signup_schema = exports.auth_signin_schema = void 0;
const zod_1 = require("zod");
exports.auth_signin_schema = zod_1.z.object({
    // id: z.number(),
    email: zod_1.z.string().email().max(255),
    password: zod_1.z.string().min(6).max(20),
});
exports.auth_signup_schema = zod_1.z.object({
    email: zod_1.z.string().email().max(255),
    username: zod_1.z.string().min(3).max(20),
    password: zod_1.z.string().min(6).max(20),
    confirmPassword: zod_1.z.string().min(6).max(20),
    role: zod_1.z.enum(["USER", "ADMIN"]).default("USER"),
});
