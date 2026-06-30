import dotenv from "dotenv";

dotenv.config();

const env = {
    PORT: process.env.PORT || 5000,

    NODE_ENV: process.env.NODE_ENV || "development",

    DATABASE_URL: process.env.DATABASE_URL,

    JWT_SECRET: process.env.JWT_SECRET,

    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",

    REDIS_URL: process.env.REDIS_URL,

    FRONTEND_URL:
        process.env.FRONTEND_URL || "http://localhost:5173",

GROQ_API_KEY: process.env.GROQ_API_KEY,   // <-- ADD THIS
};

export default env;