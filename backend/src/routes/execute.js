/**
 * ============================================================================
 * execute.js
 * ----------------------------------------------------------------------------
 * CodeSync Code Execution Routes
 *
 * Responsibilities
 * ----------------
 * • Accept execution requests from the editor.
 * • Validate execution payloads.
 * • Authenticate the user.
 * • Forward requests to executionService.
 * • Return execution metadata through HTTP headers.
 *
 * The execution itself is handled by services/executionService.js.
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

const executionService = require('../services/executionService');

/* ==========================================================================
   POST /api/execute
   ========================================================================== */

router.post('/', authMiddleware, async (req, res, next) => {

    try {

        const {
            language,
            code,
            stdin = '',
        } = req.body;

        /* -------------------------------------------------------------- */
        /* Validation                                                     */
        /* -------------------------------------------------------------- */

        if (!language) {
            return res.status(400).json({
                success: false,
                error: 'Language is required.',
            });
        }

        if (!code) {
            return res.status(400).json({
                success: false,
                error: 'Code is required.',
            });
        }

        /* -------------------------------------------------------------- */
        /* Execute                                                        */
        /* -------------------------------------------------------------- */

        const result = await executionService.execute({

            language,

            code,

            stdin,

            user: req.user,

        });

        /* -------------------------------------------------------------- */
        /* Helpful execution metadata                                     */
        /* -------------------------------------------------------------- */

        res.setHeader('X-Execution-Time', result.elapsed_ms ?? 0);

        res.setHeader(
            'X-Execution-Status',
            result.success ? 'success' : 'failure'
        );

        if (result.exit_code !== undefined) {
            res.setHeader('X-Exit-Code', result.exit_code);
        }

        /* -------------------------------------------------------------- */

        return res.status(200).json(result);

    }

    catch (err) {

        next(err);

    }

});

/* ==========================================================================
   GET /api/execute/languages
   Returns the supported execution languages.
   ========================================================================== */

router.get('/languages', authMiddleware, async (req, res, next) => {

    try {

        const languages =
            await executionService.getSupportedLanguages();

        res.json(languages);

    }

    catch (err) {

        next(err);

    }

});

module.exports = router;