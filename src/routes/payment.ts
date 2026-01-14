import express from "express";
import {
  getPayments,
  getPaymentById,
  updatePaymentStatus,
  getPaymentByStripeIntent,
} from "../controllers/payment";
import { authenticated, permission } from "../middlewares/authMiddleware";

const router = express.Router();

// All routes require authentication
router.use(authenticated);

// Get all payments for logged-in user
router.get("/", getPayments);

// Get payment by ID
router.get("/:id", getPaymentById);

// Get payment by Stripe PaymentIntent ID
router.get("/stripe/:paymentIntentId", getPaymentByStripeIntent);

// Update payment status (admin only)
router.put("/:id", permission(["ADMIN"]), updatePaymentStatus);

export default router;
