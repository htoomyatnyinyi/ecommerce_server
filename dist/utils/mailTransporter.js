"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transporter = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const secrets_1 = require("./secrets");
// Configure Nodemailer with Gmail SMTP transporter
const transporter = nodemailer_1.default.createTransport({
    host: secrets_1.EMAIL_HOST || "smtp.gmail.com",
    port: secrets_1.EMAIL_PORT || 587,
    secure: false, // Use TLS
    auth: {
        user: secrets_1.EMAIL_USER, // Your Gmail address
        pass: secrets_1.EMAIL_PASS, // Your App Password
    },
});
exports.transporter = transporter;
