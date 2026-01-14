"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
// import corsOptions from "./utils/corsOptions.ts";
const corsOptions_1 = __importDefault(require("./utils/corsOptions"));
const secrets_1 = require("./utils/secrets");
const auth_1 = __importDefault(require("./routes/auth"));
const product_1 = __importDefault(require("./routes/product"));
const cart_1 = __importDefault(require("./routes/cart"));
const category_1 = __importDefault(require("./routes/category"));
const admin_1 = __importDefault(require("./routes/admin"));
const brand_1 = __importDefault(require("./routes/brand"));
const order_1 = __importDefault(require("./routes/order"));
const address_1 = __importDefault(require("./routes/address"));
const payment_1 = __importDefault(require("./routes/payment"));
const checkout_1 = __importDefault(require("./routes/checkout"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)(corsOptions_1.default));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
// Routes
app.use("/api/auth", auth_1.default);
app.use("/admin", admin_1.default);
app.use("/api/products", product_1.default);
app.use("/api/cart", cart_1.default);
app.use("/api/order", order_1.default);
app.use("/api/payment", payment_1.default);
app.use("/api/checkout", checkout_1.default);
app.use("/api/address", address_1.default);
app.use("/api/category", category_1.default);
app.use("/api/brands", brand_1.default);
// --- Route for testing server ---
app.get("/", (req, res) => {
    console.log(req.body);
    res.send("API is running now!");
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something went wrong!" });
});
app.listen(secrets_1.PORT, () => {
    console.log(`SERVER IS RUNNING ON http://localhost:${secrets_1.PORT}`);
});
