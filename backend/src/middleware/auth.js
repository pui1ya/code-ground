/**
 * ============================================================================
 * auth.js
 * ----------------------------------------------------------------------------
 * CodeSync Authentication Middleware
 *
 * Responsibilities
 * ----------------
 * • Validate JWT access tokens.
 * • Protect private API routes.
 * • Attach authenticated user information to req.user.
 * • Provide reusable verification for Socket.IO authentication.
 *
 * This middleware is shared between HTTP requests and WebSocket
 * connections so authentication logic lives in one place.
 * ============================================================================
 */

const jwt = require("jsonwebtoken");

/* -------------------------------------------------------------------------- */
/* Configuration                                                              */
/* -------------------------------------------------------------------------- */

const JWT_SECRET = process.env.JWT_SECRET;

/* -------------------------------------------------------------------------- */
/* Token Extraction                                                           */
/* -------------------------------------------------------------------------- */

function extractToken(header = "") {

    if (!header.startsWith("Bearer ")) {

        return null;

    }

    return header.slice(7);

}

/* -------------------------------------------------------------------------- */
/* JWT Verification                                                           */
/* -------------------------------------------------------------------------- */

function verifyToken(token) {

    return jwt.verify(token, JWT_SECRET);

}

/* -------------------------------------------------------------------------- */
/* HTTP Middleware                                                            */
/* -------------------------------------------------------------------------- */

function authMiddleware(req, res, next) {

    try {

        const token = extractToken(req.headers.authorization);

        if (!token) {

            return res.status(401).json({

                success: false,

                error: "Authentication required.",

            });

        }

        const decoded = verifyToken(token);

        req.user = {

            id: decoded.id,

            username: decoded.username,

            email: decoded.email,

            is_paid: decoded.is_paid,

        };

        next();

    }

    catch (err) {

        return res.status(401).json({

            success: false,

            error: "Invalid or expired token.",

        });

    }

}

/* -------------------------------------------------------------------------- */
/* Socket.IO Authentication                                                   */
/* -------------------------------------------------------------------------- */

function authenticateSocket(socket, next) {

    try {

        const header = socket.handshake.auth?.token
            || socket.handshake.headers?.authorization;

        const token = extractToken(header);

        if (!token) {

            return next(new Error("Authentication required."));

        }

        socket.user = verifyToken(token);

        next();

    }

    catch {

        next(new Error("Unauthorized"));

    }

}

/* -------------------------------------------------------------------------- */

module.exports = authMiddleware;

/* Additional exports used elsewhere */

module.exports.verifyToken = verifyToken;
module.exports.authenticateSocket = authenticateSocket;