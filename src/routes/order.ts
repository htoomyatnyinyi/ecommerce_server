import express from "express";
import { authenticated, permission } from "../middlewares/authMiddleware";
import { checkout, order } from "../controllers/order";

const router = express.Router();

router.post("/items", authenticated, order);
router.post("/checkout", authenticated, checkout);

export default router;
