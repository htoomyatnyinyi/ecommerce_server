import express from "express";
import { authenticated } from "../middlewares/authMiddleware";
import {
  createAccount,
  getAccounts,
  updateAccount,
  deleteAccount,
  createProduct,
  updateProduct,
  deleteProduct,
  getProducts,
  getProductById,
  getCart,
  updateCart,
  deleteCart,
  getOrder,
  updateOrder,
  deleteOrder,
  getAdminStats,
  getEmployerStats,
  getDetailedAnalytics,
} from "../controllers/dashboard/admin";
// import { verifyEmail } from "../controllers/auth";

const router = express.Router();

router.use(authenticated);

router.get("/stats", getAdminStats);
router.get("/employer/stats", getEmployerStats);
router.get("/analytics", getDetailedAnalytics);

router.post("/account", createAccount);
router.get("/accounts", getAccounts);
// router.get("verify-email", verifyEmail);
router.put("/account", updateAccount);
router.put("/account/:id", updateAccount);
router.delete("/account/:id", deleteAccount);

router.post("/product", createProduct);
router.get("/products", getProducts);
router.put("/product/:id", updateProduct);
router.get("/product/:id", getProductById);
router.delete("/product/:id", deleteProduct);

router.get("/cart", getCart);
router.put("/cart/:id", updateCart);
router.delete("/cart/:id", deleteCart);

router.get("/order", getOrder);
router.put("/order/:id", updateOrder);
router.delete("/order/:id", deleteOrder);

export default router;
