import crypto from "crypto";

// Generate verification token
const token = crypto.randomBytes(32).toString("hex");
const expiresAt = new Date(Date.now() + 24 * 3600000); // 24-hour expiration

// export { token, expiresAt };
//
