import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import corsOptions from "./utils/corsOptions";
import { PORT } from "./utils/secrets";

import auth from "./routes/auth";
import product from "./routes/product";
import cart from "./routes/cart";
import category from "./routes/category";
import admin from "./routes/admin";

const app: Express = express();
// const PORT: number = parseInt(process.env.PORT || "8000");

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", auth);
app.use("/admin", admin);
app.use("/api/products", product);
app.use("/api/cart", cart);
app.use("/api/category", category);

// --- Route for testing server ---
app.get("/", (req: Request, res: Response) => {
  console.log(req.body);
  res.send("API is running now!");
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

app.listen(PORT, () => {
  console.log(`SERVER IS RUNNING ON http://localhost:${PORT}`);
});
