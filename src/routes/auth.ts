import express from "express";
import {
  signin,
  signup,
  authMe,
  signout,
  requestPasswordReset,
  verifyEmail,
  resetPassword,
  googleAuth,
} from "../controllers/auth";
import { authenticated } from "../middlewares/authMiddleware";
import {
  validateAuthSignUpInput,
  validateAuthSignInInput,
} from "../middlewares/validates/validateAuthInput";

// import { isEmailVerified } from "../utils/isEmailVerified";

const router = express.Router();

router.post("/signup", validateAuthSignUpInput, signup);
router.post("/signin", validateAuthSignInInput, signin);
router.post("/signout", signout);

router.get("/me", authenticated, authMe);
router.post("/verify-email", verifyEmail);
router.post("/request-password-reset", requestPasswordReset);
router.post("/reset-password", resetPassword);
router.get("/google", googleAuth);

export default router;
