"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const payment_1 = require("../controllers/payment");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
// All routes require authentication
router.use(authMiddleware_1.authenticated);
// Get all payments for logged-in user
router.get("/", payment_1.getPayments);
// Get payment by ID
router.get("/:id", payment_1.getPaymentById);
// Get payment by Stripe PaymentIntent ID
router.get("/stripe/:paymentIntentId", payment_1.getPaymentByStripeIntent);
// Update payment status (admin only)
router.put("/:id", (0, authMiddleware_1.permission)(["ADMIN"]), payment_1.updatePaymentStatus);
exports.default = router;
