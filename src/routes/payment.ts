import express from "express";

import {
  createPayment,
  deletePayment,
  getPayment,
  updatePayment,
} from "../controllers/payment";
import { authenticated } from "../middlewares/authMiddleware";

const router = express.Router();

// All routes are protected and require a logged-in user
router.use(authenticated);

router.get("/", getPayment);
router.post("/", createPayment);

router.put("/:id", updatePayment);
router.delete("/:id", deletePayment);

// router.route("/").get(getAddresses).post(createAddress);
// router.route("/:id").put(updateAddress).delete(deleteAddress);

export default router;
