"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };

Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cart_1 = require("../controllers/cart");

const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
router.post("/", authMiddleware_1.authenticated, cart_1.addToCart);
router.get("/", authMiddleware_1.authenticated, cart_1.getCart);
router.post("/cart-total", authMiddleware_1.authenticated, cart_1.cartTotal);
router.delete("/", authMiddleware_1.authenticated, cart_1.removeCart);
router.put("/quantity", authMiddleware_1.authenticated, cart_1.updateCart);
exports.default = router;
