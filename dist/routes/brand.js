"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const brand_1 = require("../controllers/brand");
const router = express_1.default.Router();
router.post("/", authMiddleware_1.authenticated, brand_1.createBrand);
router.get("/", brand_1.getBrands);
router.get("/", brand_1.getBrandById);
exports.default = router;
