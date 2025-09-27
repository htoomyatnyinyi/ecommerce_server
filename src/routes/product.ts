import express from "express";
import { authenticated, permission } from "../middlewares/authMiddleware";
import {
  createProduct,
  getProductById,
  getProducts,
} from "../controllers/product";

const router = express.Router();

router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", authenticated, createProduct);

export default router;
