import express from "express";
import {
  createProduct,
  getProducts,
  getProductById,
} from "../controllers/product";
import { authenticated, permission } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/new-product", authenticated, createProduct);
router.get("/", getProducts);
router.get("/:id", authenticated, permission(["USER"]), getProductById);

export default router;
