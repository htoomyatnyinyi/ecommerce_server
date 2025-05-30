import express from "express";
import { addToCart, getCart } from "../controllers/cart";
import { authenticated } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/add", authenticated, addToCart);
router.get("/", authenticated, getCart);

export default router;
