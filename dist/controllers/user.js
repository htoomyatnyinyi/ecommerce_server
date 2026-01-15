"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePassword = exports.updateProfile = void 0;
const database_1 = __importDefault(require("../config/database"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const updateProfile = async (req, res) => {
    try {
        const { username } = req.body;
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const updatedUser = await database_1.default.user.update({
            where: { id: userId },
            data: {
                username,
            },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });
        res.json(updatedUser);
    }
    catch (error) {
        if (error.code === "P2002") {
            return res.status(400).json({ message: "Username already taken" });
        }
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.updateProfile = updateProfile;
const updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const user = await database_1.default.user.findUnique({
            where: { id: userId },
        });
        if (!user || !user.password) {
            return res.status(404).json({ message: "User not found" });
        }
        const isMatch = await bcrypt_1.default.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Incorrect current password" });
        }
        const salt = await bcrypt_1.default.genSalt(10);
        const hashedPassword = await bcrypt_1.default.hash(newPassword, salt);
        await database_1.default.user.update({
            where: { id: userId },
            data: {
                password: hashedPassword,
            },
        });
        res.json({ message: "Password updated successfully" });
    }
    catch (error) {
        console.error("Update password error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.updatePassword = updatePassword;
