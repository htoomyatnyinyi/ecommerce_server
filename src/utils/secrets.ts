import dotenv from "dotenv";

dotenv.config();

const PORT: number = parseInt(process.env.PORT || "8000");
const JWT_SECRET: string = process.env.JWT_SECRET || "ekfkafj";
const JWT_REFRESH_SECRET: string = process.env.JWT_REFRESH_SECRET || "abcdef";
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
const NODE_ENV: string = process.env.NODENV || "development";
const EMAIL_HOST: string = process.env.EMAIL_HOST || "smtp.gmail.com";
const EMAIL_PORT: number = parseInt(process.env.EMAIL_PORT || "587");
const EMAIL_USER: string = process.env.EMAIL_USER || "htoomyathmnn@gmail.com";
const EMAIL_PASS: string = process.env.EMAIL_PASS || "ggix chag wcui jgxp";

const FRONTEND_URL: string =
  process.env.FRONTEND_URL || "http://localhost:5173";

const STRIPE_SECRET_KEY: string =
  "sk_test_51SpOXN5a8dgiY5gLDYwZFj3185FaE7gW878nuB89oghjWKLgpRlFcETOZaAwsbi4tHKBvLXvFFZFwww4NpkBmjvd00mIIEyDDU";
const STRIPE_WEBHOOK_SECRET: string =
  process.env.STRIPE_WEBHOOK_SECRET || "whsec_1234567890abcdef1234567890abcdef";
const STRIPE_PUBLISHABLE_KEY: string =
  "pk_test_51SpOXN5a8dgiY5gLfgQ4an5yy9cdKOqtgF4zwC9vnUw9Ad5GVYRCDuKcbqais5g3Y7q4pIlMJLiOA7zan0ZTylOW00eePk1npo";

export {
  PORT,
  JWT_SECRET,
  JWT_REFRESH_SECRET,
  COOKIE_MAX_AGE,
  NODE_ENV,
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_USER,
  EMAIL_PASS,
  FRONTEND_URL,
  STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET,
  STRIPE_PUBLISHABLE_KEY,
};
