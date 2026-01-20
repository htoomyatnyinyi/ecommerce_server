import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// import corsOptions from "./utils/corsOptions.ts";
import corsOptions from "./utils/corsOptions";
import { PORT } from "./utils/secrets";

import auth from "./routes/auth";
import product from "./routes/product";
import cart from "./routes/cart";
import category from "./routes/category";
import admin from "./routes/admin";
import brand from "./routes/brand";
import order from "./routes/order";
import address from "./routes/address";
import payment from "./routes/payment";
import checkout from "./routes/checkout";
import user from "./routes/user";

const app: Express = express();

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", auth);
app.use("/admin", admin);
app.use("/api/products", product);
app.use("/api/cart", cart);
app.use("/api/order", order);
app.use("/api/payment", payment);
app.use("/api/checkout", checkout);
app.use("/api/address", address);
app.use("/api/category", category);
app.use("/api/brands", brand);
app.use("/api/user", user);

// --- Route for testing server ---
app.get("/", (req: Request, res: Response) => {
  // console.log(req.body);
  res.send("Ecommerce API is online now!");
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

app.listen(PORT, () => {
  console.log(`SERVER IS RUNNING ON http://localhost:${PORT}`);
});
