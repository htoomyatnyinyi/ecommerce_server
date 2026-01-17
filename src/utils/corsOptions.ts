//   credentials: true, // Allow cookies and authentication headers
//   optionsSuccessStatus: 204, // For legacy browser support
// };

import { FRONTEND_URL } from "./secrets";

// export default corsOptions;

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
  origin: true, // Allow all origins in development
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: ["*"], // Allow all headers in development
  credentials: true,
  optionsSuccessStatus: 204,
};

export default corsOptions;
