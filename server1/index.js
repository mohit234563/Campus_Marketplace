// dotenv MUST be the very first import — before anything else reads process.env
import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import connectDB from "./src/db/index.js";
import { app } from "./app.js";

const PORT = process.env.PORT || 5000;

// ── Create temp upload folder if it doesn't exist ────────────────────────────
// Multer needs this directory to store files before they go to Cloudinary
if (!fs.existsSync("./public/temp")) {
    fs.mkdirSync("./public/temp", { recursive: true });
}

// ── Connect to MongoDB, then start server ─────────────────────────────────────
// We only start listening AFTER the DB is connected — no requests before DB is ready
connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error("❌ Failed to start server:", err.message);
        process.exit(1);
    });