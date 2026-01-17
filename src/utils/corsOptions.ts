import { FRONTEND_URL } from "./secrets";
import { NODE_ENV } from "./secrets";

// Dynamic origin based on allowed domains
const allowedOrigins = [
  "http://localhost:5173",
  FRONTEND_URL,
  "exp://192.168.1.143:8081",
  "exp://172.17.0.1:8081",
  "exp://192.168.137.136:8081",
  "exp://192.168.1.67:8081",
  "http://localhost:8081",
  "https://your-production-domain.com",
];

const corsOptions = {
  origin: (origin: any, callback: any) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    if (
      allowedOrigins.indexOf(origin) !== -1 ||
      process.env.NODE_ENV === "development"
    ) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
  ],
  credentials: true,
  optionsSuccessStatus: 200,
};

// const corsOptions = {
//   origin: true, // Allow all origins in development
//   methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
//   allowedHeaders: ["*"], // Allow all headers in development
//   credentials: true,
//   optionsSuccessStatus: 204,
// };

export default corsOptions;
