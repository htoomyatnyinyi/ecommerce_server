import express from "express";
import { createStock, getStocks } from "../controllers/stockController";

const router = express.Router();
router.post("/new-stock", createStock);
router.get("/", getStocks);
export default router;
