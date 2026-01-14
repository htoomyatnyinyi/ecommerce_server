"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEmailVerified = void 0;
const database_1 = __importDefault(require("../config/database"));
const isEmailVerified = async (req, res, next) => {
    try {
        const user = await database_1.default.user.findUnique({
            where: { id: req.user?.id },
        });
        if (!user) {
            res.status(401).json({ message: "User not found" });
            return;
        }
        if (!user.isEmailVerified) {
            res
                .status(403)
                .json({ message: "Please verify your email before proceeding" });
            return;
        }
        next();
    }
    catch (error) {
        console.error("Error checking email verification:", error);
        res.status(500).json({ message: "Internal server error" });
    }
    finally {
        await database_1.default.$disconnect();
    }
};
exports.isEmailVerified = isEmailVerified;
// // it usage
// app.put("/users/:id", requireEmailVerification, updateAccount);
// app.delete("/users/:id", requireEmailVerification, deleteAccount);
