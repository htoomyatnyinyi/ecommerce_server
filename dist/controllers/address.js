"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAddress = exports.updateAddress = exports.createAddress = exports.getAddresses = void 0;
const database_1 = __importDefault(require("../config/database"));
/**
 * @description Get all addresses for the logged-in user
 * @route GET /api/addresses
 * @access Private
 */
const getAddresses = async (req, res) => {
    const userId = req.user?.id;
    try {
        const addresses = await database_1.default.address.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });
        res.status(200).json(addresses);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to retrieve addresses." });
    }
};
exports.getAddresses = getAddresses;
/**
 * @description Create a new address for the logged-in user
 * @route POST /api/addresses
 * @access Private
 */
const createAddress = async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        return res
            .status(401)
            .json({ error: "Unauthorized: User not authenticated." });
    }
    const { street, city, state, country, postalCode, isDefault } = req.body;
    console.log(req.body);
    if (!street || !city || !country || !postalCode) {
        return res.status(400).json({ error: "Missing required address fields." });
    }
    try {
        // If setting a new default, we need a transaction
        if (isDefault) {
            const [_, newAddress] = await database_1.default.$transaction([
                // 1. Set all other addresses for this user to isDefault: false
                database_1.default.address.updateMany({
                    where: { userId },
                    data: { isDefault: false },
                }),
                // 2. Create the new address as the default
                database_1.default.address.create({
                    data: {
                        userId,
                        street,
                        city,
                        state,
                        country,
                        postalCode,
                        isDefault: true,
                    },
                }),
            ]);
            return res.status(201).json(newAddress);
        }
        // If not setting as default, just create it
        const newAddress = await database_1.default.address.create({
            data: {
                userId,
                street,
                city,
                state,
                country,
                postalCode,
                isDefault: false,
            },
        });
        return res.status(201).json(newAddress);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create address." });
    }
};
exports.createAddress = createAddress;
/**
 * @description Update an existing address
 * @route PUT /api/addresses/:id
 * @access Private
 */
const updateAddress = async (req, res) => {
    const userId = req.user?.id;
    const { id: addressId } = req.params;
    const { street, city, state, country, postalCode, isDefault } = req.body;
    try {
        if (isDefault) {
            const [_, updatedAddress] = await database_1.default.$transaction([
                // 1. Unset any other default addresses for the user
                database_1.default.address.updateMany({
                    where: { userId, NOT: { id: addressId } },
                    data: { isDefault: false },
                }),
                // 2. Update the target address
                database_1.default.address.update({
                    where: { id: addressId },
                    data: { street, city, state, country, postalCode, isDefault: true },
                }),
            ]);
            return res.status(200).json(updatedAddress);
        }
        // Standard update if not changing the default status
        const updatedAddress = await database_1.default.address.update({
            where: { id: addressId, userId }, // Ensures user can only update their own address
            data: { street, city, state, country, postalCode },
        });
        res.status(200).json(updatedAddress);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update address." });
    }
};
exports.updateAddress = updateAddress;
/**
 * @description Delete an address
 * @route DELETE /api/addresses/:id
 * @access Private
 */
const deleteAddress = async (req, res) => {
    const userId = req.user?.id;
    const { id: addressId } = req.params;
    try {
        // Using deleteMany ensures the user can only delete their own address
        const deleteResult = await database_1.default.address.deleteMany({
            where: {
                id: addressId,
                userId: userId,
            },
        });
        if (deleteResult.count === 0) {
            return res.status(404).json({
                error: "Address not found or you do not have permission to delete it.",
            });
        }
        res.status(200).json({ message: "Address deleted successfully." });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete address." });
    }
};
exports.deleteAddress = deleteAddress;
