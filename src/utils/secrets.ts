import dotenv from "dotenv";

dotenv.config();

const PORT: number = parseInt(process.env.PORT!);
const JWT_SECRET: string = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET: string = process.env.JWT_REFRESH_SECRET!;
const COOKIE_MAX_AGE = parseInt(process.env.COOKIE_MAX_AGE!);
const NODE_ENV: string = process.env.NODENV!;
const EMAIL_HOST: string = process.env.EMAIL_HOST!;
const EMAIL_PORT: number = parseInt(process.env.EMAIL_PORT!);
const EMAIL_USER: string = process.env.EMAIL_USER!;
const EMAIL_PASS: string = process.env.EMAIL_PASS!;

const FRONTEND_URL: string = process.env.FRONTEND_URL!;

const STRIPE_SECRET_KEY: string = process.env.STRIPE_SECRET_KEY!;
const STRIPE_WEBHOOK_SECRET: string = process.env.STRIPE_WEBHOOK_SECRET!;
const STRIPE_PUBLISHABLE_KEY: string = process.env.STRIPE_PUBLISHABLE_KEY!;

// GOOD – use environment variable
// export const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY!;

if (!STRIPE_SECRET_KEY && !STRIPE_PUBLISHABLE_KEY) {
  throw new Error(
    "STRIPE_SECRET_KEY or STRIPE_PUBLISHABLE_KEY is not defined in environment variables"
  );
}

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
