import express from "express";
import { authenticated } from "../middlewares/authMiddleware";
import { createBrand, getBrandById, getBrands } from "../controllers/brand";

const router = express.Router();

router.post("/", authenticated, createBrand);
router.get("/", getBrands);
router.get("/", getBrandById);

export default router;
