import { z } from "zod";

export const auth_signin_schema = z.object({
  // id: z.number(),
  email: z.string().email().max(255),
  password: z.string().min(6).max(20),
});

export const auth_signup_schema = z.object({
  email: z.string().email().max(255),
  username: z.string().min(3).max(20),
  password: z.string().min(6).max(20),
  confirmPassword: z.string().min(6).max(20),
  role: z.enum(["USER", "ADMIN"]).default("USER"),
});
