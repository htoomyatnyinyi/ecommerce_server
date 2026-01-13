"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const stripe_1 = __importDefault(require("stripe"));
const secrets_1 = require("../utils/secrets");
if (!secrets_1.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not defined in environment variables");
}
const stripe = new stripe_1.default(secrets_1.STRIPE_SECRET_KEY, {
    // apiVersion: "2024-12-18.acacia",
    typescript: true,
});
exports.default = stripe;
