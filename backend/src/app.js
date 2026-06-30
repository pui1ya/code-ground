/**
 * ---------------------------------------------------------
 * Code Ground
 * Express Application
 * ---------------------------------------------------------
 */

import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import authRoutes from "./routes/auth.routes.js";
import documentRoutes from "./routes/document.routes.js";
import invitationRoutes from "./routes/invitation.routes.js";
import aiRoutes from "./routes/ai.routes.js";

import env from "./config/env.js";

const app = express();

/*
|--------------------------------------------------------------------------
| Global Middlewares
|--------------------------------------------------------------------------
*/

// Security
app.use(helmet());

// Compression
app.use(compression());

// CORS
app.use(
    cors({
        origin: env.FRONTEND_URL,
        credentials: true,
    })
);

// IMPORTANT: Parse request body BEFORE routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookies
app.use(cookieParser());

// Logger
app.use(morgan("dev"));

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/invitations", invitationRoutes);
app.use("/api/ai", aiRoutes);

/*
|--------------------------------------------------------------------------
| Health Route
|--------------------------------------------------------------------------
*/

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        project: "Code Ground",
        message: "Backend is running successfully.",
        version: "1.0.0",
    });
});

/*
|--------------------------------------------------------------------------
| Unknown Routes
|--------------------------------------------------------------------------
*/

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found.",
    });
});

export default app;