import express, { Express, Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes";
import productRoutes from "./routes/productRoutes";
import stockRoutes from "./routes/stockRoutes";
import authRoutes from "./routes/authRoutes";

dotenv.config();

const app: Express = express();
const PORT: number = parseInt(process.env.PORT || "8000");

app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
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
