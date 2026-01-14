"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const checkout_1 = require("../controllers/checkout");
const router = express_1.default.Router();
// Public routes
router.get("/config", checkout_1.getStripeConfig);
// Webhook route (must be before express.json() middleware)
router.post("/webhook", express_1.default.raw({ type: "application/json" }), checkout_1.handleWebhook);
// Protected routes
router.post("/create-payment-intent", authMiddleware_1.authenticated, checkout_1.createPaymentIntent);
router.post("/confirm-payment", authMiddleware_1.authenticated, checkout_1.confirmPayment);
router.post("/cancel-payment", authMiddleware_1.authenticated, checkout_1.cancelPaymentIntent);
exports.default = router;
