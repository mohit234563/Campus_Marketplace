import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const MODEL = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
});

// Reusable safe Gemini call
const safeGenerate = async (prompt, retries = 1) => {
    try {
        const result = await MODEL.generateContent(prompt);
        return result.response.text().trim();
    } catch (error) {
        console.error("Gemini API Error:", error.message);

        // Retry once after the suggested delay for temporary rate limits
        if (error.message.includes("429") && retries > 0) {
            const delayMatch = error.message.match(/retry in (\d+)/i);
            const waitMs = delayMatch ? parseInt(delayMatch[1]) * 1000 : 25000;
            console.log(`Rate limited. Retrying in ${waitMs / 1000}s...`);
            await new Promise(r => setTimeout(r, waitMs));
            return safeGenerate(prompt, retries - 1);
        }

        if (error.message.includes("429")) {
            throw new Error("AI quota exceeded for today. Please try again tomorrow or upgrade your plan.");
        }
        if (error.message.includes("503")) {
            throw new Error("AI service is busy right now. Please try again in a moment.");
        }
        if (error.message.includes("404")) {
            throw new Error("AI model not found. Check your model name.");
        }
        if (error.message.includes("API_KEY") || error.message.includes("403")) {
            throw new Error("Invalid or missing Gemini API key.");
        }

        throw new Error("AI generation failed. Please try again.");
    }
};
const generateProductDescription = async ({
    title,
    category,
    condition,
    extraDetails
}) => {
    const prompt = `
You are helping a college student write a product listing for a campus marketplace in India.

Write a compelling, honest product description for:
- Title: ${title}
- Category: ${category}
- Condition: ${condition}
${extraDetails ? `- Extra details: ${extraDetails}` : ""}

Rules:
- Max 80 words
- Conversational, student-friendly tone
- Mention the condition honestly
- No fake claims or exaggerations
- End with one reason why a student should buy it
- Return ONLY the description text
`;

    return await safeGenerate(prompt);
};

const suggestProductPrice = async ({
    title,
    category,
    condition,
    originalPrice
}) => {
    const prompt = `
You are a pricing expert for a college campus second-hand marketplace in India.

Suggest a fair resale price range for:
- Item: ${title}
- Category: ${category}
- Condition: ${condition}
${originalPrice ? `- Original/MRP price: ₹${originalPrice}` : ""}

Rules:
- Return ONLY valid JSON
- Format:
{
  "minPrice": number,
  "maxPrice": number,
  "suggestedPrice": number,
  "reasoning": "one sentence"
}
`;

    const raw = await safeGenerate(prompt);

    const cleanJson = raw
        .replace(/```json|```/g, "")
        .trim();

    return JSON.parse(cleanJson);
};

const chatWithAssistant = async ({ messages, productContext }) => {
    const history = messages.map(
        msg => `${msg.role}: ${msg.content}`
    ).join("\n");

    const prompt = `
You are a helpful assistant for CampusMarket — a campus-only second-hand marketplace in India.

Key platform rules:
- No online payment.
- Buyers and sellers meet on campus.
- Buyer sends a request, seller accepts, then they decide meetup time/place.
- Items can be sold or rented.
- Keep answers short, helpful, and student-friendly.

${productContext
        ? `
Product:
- Title: ${productContext.title}
- Category: ${productContext.category}
- Price: ₹${productContext.price}
- Condition: ${productContext.condition}
- Listing type: ${productContext.listingType || "sell"}
- Description: ${productContext.description || "Not provided"}
`
        : ""}

Conversation:
${history}

Reply in under 100 words.
`;

    return await safeGenerate(prompt);
};

export {
    generateProductDescription,
    suggestProductPrice,
    chatWithAssistant
};