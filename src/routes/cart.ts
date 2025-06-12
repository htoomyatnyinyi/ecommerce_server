import express from "express";
import { addToCart, getCart } from "../controllers/cart";
import { authenticated } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/items", authenticated, addToCart);
router.get("/", authenticated, getCart);
// router.get("/", authenticated, getCartItem);

export default router;
