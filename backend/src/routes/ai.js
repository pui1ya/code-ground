/**
 * ============================================================================
 * ai.js
 * ----------------------------------------------------------------------------
 * CodeSync AI Routes
 *
 * Responsibilities
 * ----------------
 * • Accept AI chat requests from the editor.
 * • Validate prompt payloads.
 * • Authenticate the user.
 * • Stream AI responses using Server-Sent Events (SSE).
 *
 * The Gemini/OpenAI implementation lives in services/aiService.js.
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

const aiService = require('../services/aiService');

/* ==========================================================================
   POST /api/ai/ask
   ========================================================================== */

router.post('/ask', authMiddleware, async (req, res, next) => {

    try {

        const {
            prompt,
            context,
            documentId,
            language,
        } = req.body;

        if (!prompt || typeof prompt !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Prompt is required.',
            });
        }

        /* -------------------------------------------------------------- */
        /* Configure Server-Sent Events                                   */
        /* -------------------------------------------------------------- */

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        if (typeof res.flushHeaders === 'function') {
            res.flushHeaders();
        }

        /* -------------------------------------------------------------- */

        await aiService.streamCompletion({

            user: req.user,

            prompt,

            context,

            documentId,

            language,

            onToken(token) {

                res.write(
                    `data: ${JSON.stringify({
                        type: 'token',
                        token,
                    })}\n\n`
                );

            },

            onComplete(finalResponse) {

                res.write(
                    `data: ${JSON.stringify({
                        type: 'done',
                        message: finalResponse,
                    })}\n\n`
                );

                res.end();

            },

            onError(error) {

                res.write(
                    `data: ${JSON.stringify({
                        type: 'error',
                        error: error.message,
                    })}\n\n`
                );

                res.end();

            },

        });

    }

    catch (err) {

        next(err);

    }

});

/* ==========================================================================
   GET /api/ai/health
   Simple endpoint for checking AI availability.
   ========================================================================== */

router.get('/health', authMiddleware, async (req, res) => {

    res.json({

        success: true,

        provider: 'Gemini',

        status: 'ready',

    });

});

module.exports = router;