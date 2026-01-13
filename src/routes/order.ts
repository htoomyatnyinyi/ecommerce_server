import express from "express";
import { authenticated, permission } from "../middlewares/authMiddleware";
import {
  getOrders,
  getOrderById,
  updateOrderStatus,
  getOrderStats,
} from "../controllers/order";

const router = express.Router();

// All routes require authentication
router.use(authenticated);

// Get all orders for logged-in user
router.get("/", getOrders);

// Get order statistics
router.get("/stats", getOrderStats);

// Get specific order by ID
router.get("/:id", getOrderById);

// Update order status
router.put("/:id/status", updateOrderStatus);

export default router;
