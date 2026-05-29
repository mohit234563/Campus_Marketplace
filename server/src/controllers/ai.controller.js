import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
    generateProductDescription,
    suggestProductPrice,
    chatWithAssistant,
} from "../services/ai.service.js";

// ─────────────────────────────────────────────────────────────────────────────
// GENERATE DESCRIPTION
// POST /api/ai/generate-description
// ─────────────────────────────────────────────────────────────────────────────
const generateDescription = asyncHandler(async (req, res) => {
    const { title, category, condition, extraDetails } = req.body;

    if (!title || !category || !condition) {
        throw new ApiError(400, "Title, category, and condition are required");
    }

    const description = await generateProductDescription({ title, category, condition, extraDetails });

    return res.status(200).json(
        new ApiResponse(200, { description }, "Description generated successfully")
    );
});

// ─────────────────────────────────────────────────────────────────────────────
// SUGGEST PRICE
// POST /api/ai/suggest-price
// ─────────────────────────────────────────────────────────────────────────────
const suggestPrice = asyncHandler(async (req, res) => {
    const { title, category, condition, originalPrice } = req.body;

    if (!title || !category || !condition) {
        throw new ApiError(400, "Title, category, and condition are required");
    }

    const suggestion = await suggestProductPrice({ title, category, condition, originalPrice });

    return res.status(200).json(
        new ApiResponse(200, { suggestion }, "Price suggestion generated successfully")
    );
});

// ─────────────────────────────────────────────────────────────────────────────
// CHAT ASSISTANT
// POST /api/ai/chat
// messages[] = full conversation history, productContext = optional product
// ─────────────────────────────────────────────────────────────────────────────
const chat = asyncHandler(async (req, res) => {
    const { messages, productContext } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
        throw new ApiError(400, "Messages array is required");
    }

    const isValid = messages.every(
        (m) => ["user", "assistant"].includes(m.role) &&
               typeof m.content === "string" &&
               m.content.trim().length > 0
    );
    if (!isValid) {
        throw new ApiError(400, "Each message must have role (user/assistant) and non-empty content");
    }

    // Cap to last 20 messages to control token cost
    const trimmedMessages = messages.slice(-20);

    const reply = await chatWithAssistant({ messages: trimmedMessages, productContext });

    return res.status(200).json(
        new ApiResponse(200, { reply }, "Response generated successfully")
    );
});

export { generateDescription, suggestPrice, chat };