import express from "express";
import {
  createAddress,
  getAddresses,
  updateAddress,
  deleteAddress,
} from "../controllers/address";

import { authenticated } from "../middlewares/authMiddleware";

const router = express.Router();

// All routes are protected and require a logged-in user
router.use(authenticated);

router.get("/", getAddresses);
router.post("/", createAddress);

router.put("/:id", updateAddress);
router.delete("/:id", deleteAddress);

// router.route("/").get(getAddresses).post(createAddress);
// router.route("/:id").put(updateAddress).delete(deleteAddress);

export default router;
