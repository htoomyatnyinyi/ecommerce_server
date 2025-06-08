import express from "express";
import { createCategory, getCategory } from "../controllers/categoy";
import { authenticated } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/", authenticated, createCategory);
router.get("/", getCategory);

export default router;
