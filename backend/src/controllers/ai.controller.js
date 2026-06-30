import Groq from "groq-sdk";
import env from "../config/env.js";
import { logActivity } from "../utils/activityLogger.js";

const groq = new Groq({
    apiKey: env.GROQ_API_KEY,
});

export const query = async (req, res) => {
    try {
        const { question, documentId } = req.body;

        if (!question) {
            return res.status(400).json({
                message: "Question is required",
            });
        }

        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "system",
                    content:
                        "You are an expert coding assistant inside an online code editor. Give concise and accurate programming help.",
                },
                {
                    role: "user",
                    content: question,
                },
            ],
            temperature: 0.3,
        });

        const answer = completion.choices[0].message.content;

        await logActivity({
            userId: req.user.id,
            documentId,
            type: "AI_CHAT",
            description: question,
            metadata: { answer },
        });

        res.json({ answer });
    } catch (err) {
        console.error(err);

        res.status(500).json({
            message: err.message,
        });
    }
};