"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const order_1 = require("../controllers/order");
const router = express_1.default.Router();
// All routes require authentication
router.use(authMiddleware_1.authenticated);
// Get all orders for logged-in user
router.get("/", order_1.getOrders);
// Get order statistics
router.get("/stats", order_1.getOrderStats);
// Get specific order by ID
router.get("/:id", order_1.getOrderById);
// Update order status
router.put("/:id/status", order_1.updateOrderStatus);
exports.default = router;
