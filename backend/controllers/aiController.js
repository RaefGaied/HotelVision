import { generatePostIdeas } from "../services/aiService.js";

export const getPostIdeas = async (req, res, next) => {
    try {
        const { topic, tone = "professionnel", audience = "réseau social" } = req.body;

        const ideas = await generatePostIdeas({ topic, tone, audience });

        res.status(200).json({
            success: true,
            data: ideas,
        });
    } catch (error) {
        console.error("Gemini API error", error);
        next("Impossible de générer des idées pour le moment. Réessayez plus tard.");
    }
};
