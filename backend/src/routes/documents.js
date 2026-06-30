/**
 * ============================================================================
 * documents.js
 * ----------------------------------------------------------------------------
 * CodeSync Document Routes
 *
 * Responsibilities
 * ----------------
 * • List a user's documents
 * • Create a new document
 * • Retrieve a document
 * • Update document metadata
 * • Delete a document
 *
 * Snapshot Endpoints
 * ------------------
 * • List snapshots
 * • Create snapshot
 * • Restore snapshot
 * • Delete snapshot
 *
 * Business logic lives inside documentService.js.
 * ============================================================================
 */

const express = require('express');

const router = express.Router();

/* -------------------------------------------------------------------------- */
/* Middleware */
/* -------------------------------------------------------------------------- */

const authMiddleware = require('../middleware/auth');

/* -------------------------------------------------------------------------- */
/* Services */
/* -------------------------------------------------------------------------- */

/* ==========================================================================
   GET /api/documents
   Returns all documents owned by the authenticated user.
   ========================================================================== */

router.get('/', authMiddleware, async (req, res, next) => {
    try {

        const documents = await documentService.getDocuments(req.user);

        res.json(documents);

    } catch (err) {
        next(err);
    }
});

/* ==========================================================================
   POST /api/documents
   Creates a new collaborative document.
   ========================================================================== */

router.post('/', authMiddleware, async (req, res, next) => {
    try {

        const { title, language } = req.body;

        if (!title || !language) {
            return res.status(400).json({
                success: false,
                error: 'Title and language are required.',
            });
        }

        const document = await documentService.createDocument({
            owner: req.user,
            title,
            language,
        });

        res.status(201).json(document);

    } catch (err) {
        next(err);
    }
});

/* ==========================================================================
   GET /api/documents/:documentId
   ========================================================================== */

router.get('/:documentId', authMiddleware, async (req, res, next) => {
    try {

        const document = await documentService.getDocument(
            req.params.documentId,
            req.user
        );

        res.json(document);

    } catch (err) {
        next(err);
    }
});

/* ==========================================================================
   PATCH /api/documents/:documentId
   Updates metadata such as title or language.
   ========================================================================== */

router.patch('/:documentId', authMiddleware, async (req, res, next) => {
    try {

        const updated = await documentService.updateDocument(
            req.params.documentId,
            req.body,
            req.user
        );

        res.json(updated);

    } catch (err) {
        next(err);
    }
});

/* ==========================================================================
   DELETE /api/documents/:documentId
   ========================================================================== */

router.delete('/:documentId', authMiddleware, async (req, res, next) => {
    try {

        await documentService.deleteDocument(
            req.params.documentId,
            req.user
        );

        res.json({
            success: true,
            message: 'Document deleted successfully.',
        });

    } catch (err) {
        next(err);
    }
});

/* ==========================================================================
   SNAPSHOTS
   ========================================================================== */

/* GET /api/documents/:documentId/snapshots */

router.get('/:documentId/snapshots', authMiddleware, async (req, res, next) => {
    try {

        const snapshots = await documentService.getSnapshots(
            req.params.documentId,
            req.user
        );

        res.json(snapshots);

    } catch (err) {
        next(err);
    }
});

/* POST /api/documents/:documentId/snapshots */

router.post('/:documentId/snapshots', authMiddleware, async (req, res, next) => {
    try {

        const snapshot = await documentService.createSnapshot(
            req.params.documentId,
            req.body,
            req.user
        );

        res.status(201).json(snapshot);

    } catch (err) {
        next(err);
    }
});

/* POST /api/documents/:documentId/snapshots/:snapshotId/restore */

router.post(
    '/:documentId/snapshots/:snapshotId/restore',
    authMiddleware,
    async (req, res, next) => {
        try {

            const restored = await documentService.restoreSnapshot(
                req.params.documentId,
                req.params.snapshotId,
                req.user
            );

            res.json(restored);

        } catch (err) {
            next(err);
        }
    }
);

/* DELETE /api/documents/:documentId/snapshots/:snapshotId */

router.delete(
    '/:documentId/snapshots/:snapshotId',
    authMiddleware,
    async (req, res, next) => {
        try {

            await documentService.deleteSnapshot(
                req.params.documentId,
                req.params.snapshotId,
                req.user
            );

            res.json({
                success: true,
                message: 'Snapshot deleted successfully.',
            });

        } catch (err) {
            next(err);
        }
    }
);

module.exports = router;