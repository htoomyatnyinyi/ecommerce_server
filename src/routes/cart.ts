import express from "express";
import {
  addToCart,
  cartTotal,
  getCart,
  removeCart,
  updateCart,
} from "../controllers/cart";
import { authenticated } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/", authenticated, addToCart);
router.get("/", authenticated, getCart);
router.post("/cart-total", authenticated, cartTotal);
router.delete("/", authenticated, removeCart);
router.put("/quantity", authenticated, updateCart);

export default router;
