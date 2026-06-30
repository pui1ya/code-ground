import prisma from "../lib/prisma.js";
import { logActivity } from "../utils/activityLogger.js";
/*
POST /api/documents
*/

export const createDocument = async (req, res) => {
    try {

        const { title, language } = req.body;

        if (!title || !language) {
            return res.status(400).json({
                message: "Title and language are required"
            });
        }

        const document = await prisma.document.create({

            data: {

                title,

                language,

                ownerId: req.user.id

            }

        });

        await logActivity({
            userId: req.user.id,
            documentId: document.id,
            type: "DOCUMENT_CREATED",
            description: "Document created",
        });

        res.status(201).json(document);

    }

    catch (err) {
    console.error(err);

    res.status(500).json({
        message: err.message,
        error: err
    });
}
};


/*
GET /api/documents
*/

export const getDocuments = async (req, res) => {
    try {

        const docs = await prisma.document.findMany({
            where: {
                OR: [
                    {
                        ownerId: req.user.id,
                    },
                    {
                        members: {
                            some: {
                                userId: req.user.id,
                            },
                        },
                    },
                ],
            },
            orderBy: {
                updatedAt: "desc",
            },
        });

        res.json(docs);

    } catch (err) {
        console.error(err);

        res.status(500).json({
            message: "Server Error",
        });
    }
};


/*
GET /api/documents/:id
*/

export const getDocument = async (req, res) => {

    try {

        const doc = await prisma.document.findFirst({

            where: {

                id: req.params.id,

                ownerId: req.user.id

            }

        });

        if (!doc)

            return res.status(404).json({

                message: "Document not found"

            });

        res.json(doc);

    }

    catch (err) {
    console.error(err);

    res.status(500).json({
        message: err.message || "Server Error"
    });
}

};


/*
PUT /api/documents/:id
*/

export const updateDocument = async (req, res) => {

    try {

        const { title, language, content } = req.body;

        const existing = await prisma.document.findFirst({
    where: {
        id: req.params.id,
        ownerId: req.user.id,
    },
});

if (!existing) {
    return res.status(404).json({
        message: "Document not found",
    });
}

const doc = await prisma.document.update({
    where: {
        id: req.params.id,
    },
    data: {
    ...(title !== undefined && { title }),
    ...(language !== undefined && { language }),
    ...(content !== undefined && { content }),
},
});

res.json(doc);

if (existing.language !== language) {
    await logActivity({
        userId: req.user.id,
        documentId: existing.id,
        type: "LANGUAGE_CHANGE",
        description: `Changed language from ${existing.language} to ${language}`,
    });
}


    }

    catch (err) {
    console.error(err);

    res.status(500).json({
        message: err.message || "Server Error"
    });
}

};


/*
DELETE /api/documents/:id
*/

export const deleteDocument = async (req, res) => {

    try {

        const existing = await prisma.document.findFirst({
    where: {
        id: req.params.id,
        ownerId: req.user.id,
    },
});

if (!existing) {
    return res.status(404).json({
        message: "Document not found",
    });
}

await prisma.document.delete({
    where: {
        id: req.params.id,
    },
});

res.json({
    success: true,
});

await logActivity({
    userId: req.user.id,
    documentId: existing.id,
    type: "DELETE_DOCUMENT",
    description: `Deleted "${deletedTitle}"`,
});

    }

    catch (err) {
    console.error(err);

    res.status(500).json({
        message: err.message || "Server Error"
    });
}

};

export const getMembers = async (req, res) => {

    try {

        const members = await prisma.documentMember.findMany({

            where: {

                documentId: req.params.id

            },

            include: {

                user: {

                    select: {

                        id: true,
                        username: true,
                        email: true

                    }

                }

            }

        });

        res.json(members);

    }

    catch (err) {

        console.error(err);

        res.status(500).json({

            message: "Server Error"

        });

    }

};