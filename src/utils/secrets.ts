import dotenv from "dotenv";

dotenv.config();

const PORT: number = parseInt(process.env.PORT || "8000");
const JWT_SECRET: string = process.env.JWT_SECRET || "ekfkafj";
const JWT_REFRESH_SECRET: string = process.env.JWT_REFRESH_SECRET || "abcdef";
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
const NODE_ENV: string = process.env.NODENV || "production";
const EMAIL_HOST: string = process.env.EMAIL_HOST || "smtp.gmail.com";
const EMAIL_PORT: number = parseInt(process.env.EMAIL_PORT || "587");
const EMAIL_USER: string = process.env.EMAIL_USER || "htoomyathmnn@gmail.com";
const EMAIL_PASS: string = process.env.EMAIL_PASS || "ggix chag wcui jgxp";

const FRONTEND_URL: string =
  process.env.FRONTEND_URL || "http://localhost:5173";

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
};
