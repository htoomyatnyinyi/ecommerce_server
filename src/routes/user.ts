import express from "express";
import { updateProfile, updatePassword } from "../controllers/user";
import { authenticated } from "../middlewares/authMiddleware";

const router = express.Router();

router.use(authenticated);

router.put("/profile", updateProfile);
router.put("/password", updatePassword);

export default router;
