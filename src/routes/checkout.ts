import express from "express";
import { authenticated } from "../middlewares/authMiddleware";
import {
  createPaymentIntent,
  confirmPayment,
  handleWebhook,
  getStripeConfig,
  // cancelPaymentIntent, // checkout not setup yet.
} from "../controllers/checkout";

const router = express.Router();

// Public routes
router.get("/config", getStripeConfig);

// Webhook route (must be before express.json() middleware)
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  handleWebhook
);

// Protected routes
router.post("/create-payment-intent", authenticated, createPaymentIntent);
router.post("/confirm-payment", authenticated, confirmPayment);
// router.post("/cancel-payment", authenticated, cancelPaymentIntent);

export default router;
