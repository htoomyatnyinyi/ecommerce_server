import express from "express";
import {
  createProduct,
  // getProductById,
  getProducts,
} from "../controllers/productController";
const router = express.Router();

router.post("/new-product", createProduct);
router.get("/", getProducts);
// router.get("/:id", getProductById);

export default router;
