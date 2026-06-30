import prisma from "../lib/prisma.js";

export const logActivity = async ({
    userId,
    documentId = null,
    sessionId = null,
    type,
    description,
    metadata = null,
}) => {
    try {
        await prisma.activity.create({
            data: {
                userId,
                documentId,
                sessionId,
                type,
                description,
                metadata,
            },
        });
    } catch (err) {
        console.error("Activity Logger:", err.message);
    }
};