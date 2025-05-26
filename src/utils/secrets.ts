import dotenv from "dotenv";

dotenv.config();

const PORT: number = parseInt(process.env.PORT || "8000");
const JWT_SECRET: string = process.env.JWT_SECRET || "ekfkafj";
const JWT_REFRESH_SECRET: string = process.env.JWT_REFRESH_SECRET || "abcdef";

export { PORT, JWT_SECRET, JWT_REFRESH_SECRET };
