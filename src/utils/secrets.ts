import dotenv from "dotenv";

dotenv.config();

const PORT: number = parseInt(process.env.PORT || "8000");
const JWT_SECRET: string = process.env.JWT_SECRET || "ekfkafj";
const JWT_REFRESH_SECRET: string = process.env.JWT_REFRESH_SECRET || "abcdef";
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

export { PORT, JWT_SECRET, JWT_REFRESH_SECRET, COOKIE_MAX_AGE };
