"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOrder = exports.updateOrder = exports.getOrder = exports.deleteCart = exports.updateCart = exports.getCart = exports.deleteProduct = exports.updateProduct = exports.getProductById = exports.getProducts = exports.createProduct = exports.deleteAccount = exports.updateAccount = exports.getAccounts = exports.createAccount = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = __importDefault(require("../../config/database"));
const secrets_1 = require("../../utils/secrets");
const bcrypt_1 = __importDefault(require("bcrypt"));
const createAccount = async (req, res) => {
    const userId = req.user?.id; // const {id} = req.user
    console.log(userId, "middleware");
    try {
        const { username, email, password, confirmPassword, role } = req.body;
        if (password !== confirmPassword) {
            res.status(400).json({ error: "Passwords do not match" });
            return;
        }
        const salt = await bcrypt_1.default.genSalt(10);
        const hashedPassword = await bcrypt_1.default.hash(password, salt);
        console.log(role, "role");
        if (!role) {
            res.status(400).json({ error: "Role is required" });
            return;
        }
        if (!["ADMIN", "EMPLOYER", "USER"].includes(role)) {
            res.status(400).json({ error: "Invalid role" });
            return;
        }
        const user = await database_1.default.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
                role,
            },
        });
        // console.log(user, "check");
        const accessToken = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, secrets_1.JWT_SECRET, {
            expiresIn: "1d", //7
        });
        res.cookie("access_", accessToken, {
            httpOnly: true,
            secure: secrets_1.NODE_ENV === "production",
            maxAge: 1000 * 60 * 60 * 24, // 1 day
            sameSite: "strict",
        });
        res.status(201).json({
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt,
            },
        });
    }
    catch (error) {
        console.log(error);
        if (error.code === "P2002") {
            res.status(400).json({
                error: "User with this email or username already exists",
            });
            return;
        }
        res.status(400).json({ error: error.message });
    }
};
exports.createAccount = createAccount;
// const getAccount = async (req: Request, res: Response): Promise<any> => {
//   const userId = req.user?.id; // const {id} = req.user
//   console.log(userId, "middleware");
//   try {
//     res.status(201).json({ mesg: "success" });
//   } catch (error) {}
// };
const getAccounts = async (req, res) => {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    console.log(userId, userRole, "middleware");
    try {
        const accounts = await database_1.default.user.findMany();
        console.log(accounts);
        res.status(200).json(accounts);
    }
    catch (error) {
        res.status(400).json(error);
    }
};
exports.getAccounts = getAccounts;
const updateAccount = async (req, res) => {
    try {
        const userId = req.user?.id; // Admin or user ID from middleware
        const userRole = req.user?.role; // Role from middleware
        const { id: accountId } = req.params; // Extract accountId from params
        const { username, email, role } = req.body; // Extract fields to update
        // Validate input
        if (!accountId) {
            res.status(400).json({ message: "Account ID is required" });
            return;
        }
        if (!username && !email && !role) {
            res.status(400).json({
                message: "At least one field (username or email) must be provided",
            });
            return;
        }
        // Authorization check
        if (userRole !== "ADMIN" && userId !== accountId) {
            res.status(403).json({ message: "Unauthorized to update this account" });
            return;
        }
        // Prepare update data, only including provided fields
        const updateData = {};
        if (username)
            updateData.username = username;
        if (email)
            updateData.email = email;
        if (role)
            updateData.role = role;
        // Perform the update
        const updatedUser = await database_1.default.user.update({
            where: { id: accountId },
            data: updateData,
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
            },
        });
        // Send response
        res.status(200).json({
            message: "Account updated successfully",
            user: updatedUser,
        });
    }
    catch (error) {
        console.error("Error updating account:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.updateAccount = updateAccount;
const deleteAccount = async (req, res) => {
    try {
        const userId = req.user?.id; // Admin or user ID from middleware
        const userRole = req.user?.role; // Role from middleware
        const { id: accountId } = req.params; // Extract accountId from params
        // Validate input
        if (!accountId) {
            res.status(400).json({ message: "Account ID is required" });
            return;
        }
        // Authorization check
        if (userRole !== "ADMIN" && userId !== accountId) {
            res.status(403).json({ message: "Unauthorized to delete this account" });
            return;
        }
        // Check if the user exists
        const user = await database_1.default.user.findUnique({
            where: { id: accountId },
        });
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        // Perform the deletion
        await database_1.default.user.delete({
            where: { id: accountId },
        });
        // Send response
        res.status(200).json({
            message: "Account deleted successfully",
        });
    }
    catch (error) {
        console.error("Error deleting account:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.deleteAccount = deleteAccount;
const createProduct = async (req, res) => {
    const userId = req.user?.id; // const {id} = req.user
    console.log(userId, "middleware");
    try {
        res.status(201).json({ mesg: "success" });
    }
    catch (error) { }
};
exports.createProduct = createProduct;
const getProducts = async (req, res) => {
    const userId = req.user?.id; // const {id} = req.user
    console.log(userId, "middleware");
    try {
        res.status(201).json({ mesg: "success" });
    }
    catch (error) { }
};
exports.getProducts = getProducts;
const getProductById = async (req, res) => {
    const userId = req.user?.id; // const {id} = req.user
    console.log(userId, "middleware");
    try {
        res.status(201).json({ mesg: "success" });
    }
    catch (error) { }
};
exports.getProductById = getProductById;
const updateProduct = async (req, res) => {
    const userId = req.user?.id; // const {id} = req.user
    console.log(userId, "middleware");
    try {
        res.status(201).json({ mesg: "success" });
    }
    catch (error) { }
};
exports.updateProduct = updateProduct;
const deleteProduct = async (req, res) => {
    const userId = req.user?.id; // const {id} = req.user
    console.log(userId, "middleware");
    try {
        res.status(201).json({ mesg: "success" });
    }
    catch (error) { }
};
exports.deleteProduct = deleteProduct;
const getCart = async (req, res) => {
    const userId = req.user?.id; // const {id} = req.user
    console.log(userId, "middleware");
    try {
        res.status(201).json({ mesg: "success" });
    }
    catch (error) { }
};
exports.getCart = getCart;
const updateCart = async (req, res) => {
    const userId = req.user?.id; // const {id} = req.user
    console.log(userId, "middleware");
    try {
        res.status(201).json({ mesg: "success" });
    }
    catch (error) { }
};
exports.updateCart = updateCart;
const deleteCart = async (req, res) => {
    const userId = req.user?.id; // const {id} = req.user
    console.log(userId, "middleware");
    try {
        res.status(201).json({ mesg: "success" });
    }
    catch (error) { }
};
exports.deleteCart = deleteCart;
const getOrder = async (req, res) => {
    const userId = req.user?.id; // const {id} = req.user
    console.log(userId, "middleware");
    try {
        res.status(201).json({ mesg: "success" });
    }
    catch (error) { }
};
exports.getOrder = getOrder;
const updateOrder = async (req, res) => {
    const userId = req.user?.id; // const {id} = req.user
    console.log(userId, "middleware");
    try {
        res.status(201).json({ mesg: "success" });
    }
    catch (error) { }
};
exports.updateOrder = updateOrder;
const deleteOrder = async (req, res) => {
    const userId = req.user?.id; // const {id} = req.user
    console.log(userId, "middleware");
    try {
        res.status(201).json({ mesg: "success" });
    }
    catch (error) { }
};
exports.deleteOrder = deleteOrder;
