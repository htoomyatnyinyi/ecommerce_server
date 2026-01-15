"use strict";
//   credentials: true, // Allow cookies and authentication headers
//   optionsSuccessStatus: 204, // For legacy browser support
// };
Object.defineProperty(exports, "__esModule", { value: true });
const secrets_1 = require("./secrets");
// export default corsOptions;
// Dynamic origin based on allowed domains
const allowedOrigins = [
    "http://localhost:5173",
    secrets_1.FRONTEND_URL,
    "https://your-production-domain.com",
];
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    optionsSuccessStatus: 204,
};
exports.default = corsOptions;
