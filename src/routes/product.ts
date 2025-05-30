import express from "express";
import { createNewProduct, getProducts } from "../controllers/products/product";
import { authenticated, permission } from "../middlewares/authMiddleware";

const router = express.Router();

router.get("/all", getProducts);
router.post("/", authenticated, createNewProduct);
// router.get("/:id", authenticated, permission(["USER"]), getProductById);
// router.delete("/:id", authenticated, permission(["USER"]), deleteProduct);

export default router;
