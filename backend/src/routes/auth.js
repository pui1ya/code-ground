/**
 * ============================================================================
 * auth.js
 * ----------------------------------------------------------------------------
 * CodeSync Authentication Routes
 *
 * Responsibilities
 * ----------------
 * • User registration
 * • User login
 * • Current session (/me)
 * • Logout
 *
 * Business logic intentionally lives in authService.js.
 * This file only validates requests and delegates work.
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
   POST /api/auth/register
   ========================================================================== */

router.post('/register', async (req, res, next) => {
    try {

        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Username, email and password are required.',
            });
        }

        const result = await authService.register({
            username,
            email,
            password,
        });

        return res.status(201).json(result);

    } catch (err) {
        next(err);
    }
});

/* ==========================================================================
   POST /api/auth/login
   ========================================================================== */

router.post('/login', async (req, res, next) => {
    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password are required.',
            });
        }

        const result = await authService.login({
            email,
            password,
        });

        return res.json(result);

    } catch (err) {
        next(err);
    }
});

/* ==========================================================================
   GET /api/auth/me
   ========================================================================== */

router.get('/me', authMiddleware, async (req, res, next) => {
    try {

        const user = await authService.getCurrentUser(req.user);

        return res.json(user);

    } catch (err) {
        next(err);
    }
});

/* ==========================================================================
   POST /api/auth/logout
   ========================================================================== */

router.post('/logout', authMiddleware, async (req, res, next) => {
    try {

        await authService.logout(req.user);

        return res.json({
            success: true,
            message: 'Logged out successfully.',
        });

    } catch (err) {
        next(err);
    }
});

module.exports = router;