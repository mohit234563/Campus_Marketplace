// app.js — Express app setup (separate from server startup in index.js)
// Keeping these separate makes testing easier — you can import app without
// actually starting the server

import dotenv from 'dotenv'
dotenv.config()
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// Routes
import authRoutes from "./src/routes/auth.routes.js";
import userRoutes from "./src/routes/user.routes.js";
import productRoutes from "./src/routes/product.routes.js";
import orderRoutes from "./src/routes/order.routes.js";
import aiRoutes from "./src/routes/ai.routes.js"

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────

app.use(cors({
    origin: [process.env.CLIENT_URL,
    "http://localhost:5173"],  // Vite dev server
    credentials: true,          // Required for cookies to be sent cross-origin
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
}));

app.use(express.json({ limit: "16kb" }));           // Parse JSON bodies (limit prevents large payloads)
app.use(express.urlencoded({ extended: true, limit: "16kb" })); // Parse form data
app.use(cookieParser());                            // Parse cookies (needed for httpOnly token cookies)

//  Routes 
app.use("/api/v2/auth", authRoutes);
app.use("/api/v2/users", userRoutes);
app.use("/api/v2/products", productRoutes);
app.use("/api/v2/orders", orderRoutes);
app.use("/api/v2/ai",aiRoutes);
//  Health Check 
app.get("/api/v2/health", (req, res) => {
    res.status(200).json({ status: "ok", message: "Campus Marketplace API is running" });
});

//  Global Error Handler 
// Catches any error thrown via next(err) or from asyncHandler
// Must have 4 params for Express to recognize it as an error handler
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    return res.status(statusCode).json({
        success: false,
        statusCode,
        message,
        errors: err.errors || [],
        // Only show stack trace in development — never in production
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
});

export { app };