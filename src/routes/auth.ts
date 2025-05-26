import express from "express";
import { signin, signup, authMe, signout } from "../controllers/auth";
import { authenticated } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
// router.get("/me", me);
router.post("/signout", authenticated, signout);
router.get("/authme", authenticated, authMe);
export default router;
