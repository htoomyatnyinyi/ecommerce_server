import express from "express";
import {
  signin,
  signup,
  authMe,
  signout,
  requestPasswordReset,
} from "../controllers/auth";
import { authenticated } from "../middlewares/authMiddleware";
import {
  validateAuthSignUpInput,
  validateAuthSignInInput,
} from "../middlewares/validates/validateAuthInput";

const router = express.Router();

router.post("/signup", validateAuthSignUpInput, signup);
router.post("/signin", validateAuthSignInInput, signin);
router.post("/signout", authenticated, signout);
router.get("/authme", authenticated, authMe);
router.post("/reset-password-request", authenticated, requestPasswordReset);

export default router;
