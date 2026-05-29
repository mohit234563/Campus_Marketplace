import { Router } from "express";
import rateLimit from "express-rate-limit";
import { generateDescription, suggestPrice, chat } from "../controllers/ai.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// 20 requests per 15 minutes per IP — AI calls cost real money
const aiRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: {
        success: false,
        message: "Too many AI requests. Please wait a few minutes before trying again.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

router.use(verifyJWT);
router.use(aiRateLimit);

router.post("/generate-description", generateDescription);
router.post("/suggest-price", suggestPrice);
router.post("/chat", chat);

export default router;