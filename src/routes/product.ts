import express from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  deleteProduct,
} from "../controllers/product";
import { authenticated, permission } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/new-product", authenticated, createProduct);
router.get("/", getProducts);
router.get("/:id", authenticated, permission(["USER"]), getProductById);
router.delete("/:id", authenticated, permission(["USER"]), deleteProduct);

export default router;
