"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const address_1 = require("../controllers/address");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
// All routes are protected and require a logged-in user
router.use(authMiddleware_1.authenticated);
router.get("/", address_1.getAddresses);
router.post("/", address_1.createAddress);
router.put("/:id", address_1.updateAddress);
router.delete("/:id", address_1.deleteAddress);
// router.route("/").get(getAddresses).post(createAddress);
// router.route("/:id").put(updateAddress).delete(deleteAddress);
exports.default = router;
