import express from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  deleteProduct,
} from "../controllers/product";
import { authenticated, permission } from "../middlewares/authMiddleware";

const router = express.Router();

router.get("/", getProducts);
router.post("/", authenticated, createProduct);
router.get("/:id", authenticated, permission(["USER"]), getProductById);
router.delete("/:id", authenticated, permission(["USER"]), deleteProduct);

export default router;
