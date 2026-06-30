import prisma from "../lib/prisma.js";

/*
POST /api/invitations
*/

export const inviteUser = async (req, res) => {
    try {

        const { documentId, email } = req.body;

        if (!documentId || !email) {
            return res.status(400).json({
                message: "Document ID and email are required",
            });
        }

        // document must belong to inviter
        const document = await prisma.document.findFirst({
            where: {
                id: documentId,
                ownerId: req.user.id,
            },
        });

        if (!document) {
            return res.status(404).json({
                message: "Document not found",
            });
        }

        const invitation = await prisma.invitation.create({
            data: {
                documentId,
                email,
                invitedBy: req.user.id,
            },
        });

        res.status(201).json(invitation);

    } catch (err) {
        console.error(err);

        res.status(500).json({
            message: "Server Error",
        });
    }
};

export const acceptInvitation = async (req, res) => {
    try {

        const { id } = req.params;

        const invitation = await prisma.invitation.findUnique({
            where: { id }
        });

        if (!invitation) {
            return res.status(404).json({
                message: "Invitation not found"
            });
        }

        if (invitation.status === "accepted") {
            return res.status(400).json({
                message: "Invitation already accepted"
            });
        }

        // logged-in user
        const user = await prisma.user.findUnique({
            where: {
                id: req.user.id
            }
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (user.email !== invitation.email) {
            return res.status(403).json({
                message: "This invitation is not for you"
            });
        }

        await prisma.documentMember.create({
            data: {
                documentId: invitation.documentId,
                userId: req.user.id,
                role: "editor"
            }
        });

        await prisma.invitation.update({
            where: {
                id
            },
            data: {
                status: "accepted"
            }
        });

        res.json({
            success: true
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Server Error"
        });

    }
};