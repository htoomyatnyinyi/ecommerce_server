import nodemailer from "nodemailer";
import { EMAIL_HOST, EMAIL_PASS, EMAIL_PORT, EMAIL_USER } from "./secrets";

// Configure Nodemailer with Gmail SMTP transporter
const transporter = nodemailer.createTransport({
  host: EMAIL_HOST || "smtp.gmail.com",
  port: EMAIL_PORT || 587,
  secure: false, // Use TLS
  auth: {
    user: EMAIL_USER, // Your Gmail address
    pass: EMAIL_PASS, // Your App Password
  },
});
export { transporter };
