import express from "express";
import { authenticated } from "../middlewares/authMiddleware";
import { checkout, createOrder, getOrder, order } from "../controllers/order";

const router = express.Router();

router.get("/orders", authenticated, getOrder);
router.post("/orders", authenticated, createOrder);

// example
// router.get("/order", authenticated, order);
router.get("/items", authenticated, order);
router.get("/checkout", authenticated, checkout);

export default router;
