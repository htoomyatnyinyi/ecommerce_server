import express from "express";
import { authenticated, permission } from "../middlewares/authMiddleware";
import { createProduct, getProducts } from "../controllers/product";

const router = express.Router();

router.get("/", getProducts);
router.post("/", authenticated, createProduct);

export default router;
