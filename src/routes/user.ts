import express from "express";
import {
  updateProfile,
  updatePassword,
  savePushToken,
} from "../controllers/user";
import { authenticated } from "../middlewares/authMiddleware";

const router = express.Router();

router.use(authenticated);

router.put("/profile", updateProfile);
router.put("/password", updatePassword);
router.post("/push-token", savePushToken);

export default router;
