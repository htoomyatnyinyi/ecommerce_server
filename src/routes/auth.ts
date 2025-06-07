import express from "express";
import {
  signin,
  signup,
  authMe,
  signout,
  requestPasswordReset,
  verifyEmail,
} from "../controllers/auth";
import { authenticated } from "../middlewares/authMiddleware";
import {
  validateAuthSignUpInput,
  validateAuthSignInInput,
} from "../middlewares/validates/validateAuthInput";
import { isEmailVerified } from "../utils/isEmailVerified";

const router = express.Router();

router.post("/signup", validateAuthSignUpInput, signup);
router.post("/signin", validateAuthSignInInput, signin);
router.post("/verify-email", verifyEmail);
router.post("/signout", authenticated, signout);
router.get("/authme", authenticated, authMe);
router.post("/reset-password-request", authenticated, requestPasswordReset);

export default router;
