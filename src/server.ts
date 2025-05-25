import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";

import productRoutes from "./routes/productRoutes";
import stockRoutes from "./routes/stockRoutes";
import authRoutes from "./routes/authRoutes";

import dotenv from "dotenv";
import corsOptions from "./utils/corsOptions";

dotenv.config();

const app: Express = express();
const PORT: number = parseInt(process.env.PORT || "8000");

app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use("/api/products", productRoutes);
app.use("/api/stocks", stockRoutes);
app.use("/api/auth", authRoutes);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

app.listen(PORT, () => {
  console.log(`SERVER IS RUNNING ON http://localhost:${PORT}`);
});
