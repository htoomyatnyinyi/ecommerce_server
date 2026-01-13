"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaymentByStripeIntent = exports.updatePaymentStatus = exports.getPaymentById = exports.getPayments = void 0;
const database_1 = __importDefault(require("../config/database"));
/**
 * @description Get all payments for the logged-in user's orders
 * @route GET /api/payment
 * @access Private
 */
const getPayments = async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        return res
            .status(401)
            .json({ error: "Unauthorized: User not authenticated." });
    }
    try {
        const payments = await database_1.default.payment.findMany({
            where: {
                order: {
                    userId: userId,
                },
            },
            include: {
                order: {
                    select: {
                        id: true,
                        totalPrice: true,
                        status: true,
                        createdAt: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });
        res.status(200).json({ success: true, payments });
    }
    catch (error) {
        console.error("Error fetching payments:", error);
        res.status(500).json({ error: "Failed to retrieve payments." });
    }
};
exports.getPayments = getPayments;
/**
 * @description Get a specific payment by ID
 * @route GET /api/payment/:id
 * @access Private
 */
const getPaymentById = async (req, res) => {
    const userId = req.user?.id;
    const { id: paymentId } = req.params;
    if (!userId) {
        return res
            .status(401)
            .json({ error: "Unauthorized: User not authenticated." });
    }
    try {
        const payment = await database_1.default.payment.findFirst({
            where: {
                id: paymentId,
                order: {
                    userId: userId,
                },
            },
            include: {
                order: {
                    include: {
                        items: {
                            include: {
                                product: true,
                                variant: true,
                            },
                        },
                        shippingAddress: true,
                        billingAddress: true,
                    },
                },
            },
        });
        if (!payment) {
            return res.status(404).json({ error: "Payment not found." });
        }
        res.status(200).json({ success: true, payment });
    }
    catch (error) {
        console.error("Error fetching payment:", error);
        res.status(500).json({ error: "Failed to retrieve payment." });
    }
};
exports.getPaymentById = getPaymentById;
/**
 * @description Update payment status (admin only)
 * @route PUT /api/payment/:id
 * @access Private/Admin
 */
const updatePaymentStatus = async (req, res) => {
    const { id: paymentId } = req.params;
    const { paymentStatus } = req.body;
    if (!paymentStatus) {
        return res.status(400).json({ error: "Payment status is required." });
    }
    try {
        const updatedPayment = await database_1.default.payment.update({
            where: { id: paymentId },
            data: { paymentStatus },
            include: {
                order: true,
            },
        });
        res.status(200).json({ success: true, payment: updatedPayment });
    }
    catch (error) {
        console.error("Error updating payment:", error);
        res.status(500).json({ error: "Failed to update payment status." });
    }
};
exports.updatePaymentStatus = updatePaymentStatus;
/**
 * @description Get payment by Stripe PaymentIntent ID
 * @route GET /api/payment/stripe/:paymentIntentId
 * @access Private
 */
const getPaymentByStripeIntent = async (req, res) => {
    const userId = req.user?.id;
    const { paymentIntentId } = req.params;
    if (!userId) {
        return res
            .status(401)
            .json({ error: "Unauthorized: User not authenticated." });
    }
    try {
        const payment = await database_1.default.payment.findFirst({
            where: {
                stripePaymentIntentId: paymentIntentId,
                order: {
                    userId: userId,
                },
            },
            include: {
                order: {
                    include: {
                        items: {
                            include: {
                                product: true,
                                variant: true,
                            },
                        },
                    },
                },
            },
        });
        if (!payment) {
            return res.status(404).json({ error: "Payment not found." });
        }
        res.status(200).json({ success: true, payment });
    }
    catch (error) {
        console.error("Error fetching payment by Stripe intent:", error);
        res.status(500).json({ error: "Failed to retrieve payment." });
    }
};
exports.getPaymentByStripeIntent = getPaymentByStripeIntent;
