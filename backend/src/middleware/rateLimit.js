/**
 * ============================================================================
 * rateLimit.js
 * ----------------------------------------------------------------------------
 * CodeSync AI Rate Limiter
 *
 * Responsibilities
 * ----------------
 * • Restrict Free users to 50 AI requests per calendar month.
 * • Allow unlimited requests for Pro users.
 * • Store request counts in Redis.
 * • Return HTTP 429 when the quota is exceeded.
 *
 * Expected Redis Key Format:
 *
 *     ai_limit:<userId>:YYYY-MM
 *
 * Example:
 *
 *     ai_limit:42:2026-06
 *
 * Value:
 *
 *     18
 *
 * ============================================================================
 */

const redis = require("../db/redis");

const MONTHLY_LIMIT = 50;

/* -------------------------------------------------------------------------- */

function currentMonthKey() {

    const now = new Date();

    const year = now.getUTCFullYear();

    const month = String(now.getUTCMonth() + 1).padStart(2, "0");

    return `${year}-${month}`;

}

/* -------------------------------------------------------------------------- */

async function rateLimit(req, res, next) {

    try {

        /* -------------------------------------------------------------- */
        /* User must already be authenticated by auth.js                  */
        /* -------------------------------------------------------------- */

        const user = req.user;

        if (!user) {

            return res.status(401).json({

                success: false,

                error: "Unauthorized",

            });

        }

        /* -------------------------------------------------------------- */
        /* Pro users bypass limits                                        */
        /* -------------------------------------------------------------- */

        if (user.is_paid) {

            return next();

        }

        /* -------------------------------------------------------------- */

        const key = `ai_limit:${user.id}:${currentMonthKey()}`;

        let count = await redis.get(key);

        count = Number(count || 0);

        /* -------------------------------------------------------------- */

        if (count >= MONTHLY_LIMIT) {

            return res.status(429).json({

                success: false,

                error: "Monthly AI request limit reached.",

                limit: MONTHLY_LIMIT,

            });

        }

        /* -------------------------------------------------------------- */

        count = await redis.incr(key);

        /*
         * Set expiry only when the key is first created.
         * 32 days ensures it survives the current month.
         */

        if (count === 1) {

            await redis.expire(key, 60 * 60 * 24 * 32);

        }

        /* -------------------------------------------------------------- */

        res.setHeader(

            "X-RateLimit-Limit",

            MONTHLY_LIMIT

        );

        res.setHeader(

            "X-RateLimit-Remaining",

            MONTHLY_LIMIT - count

        );

        next();

    }

    catch (err) {

        console.error("Rate limiter error:", err);

        /*
         * If Redis is temporarily unavailable we allow the request
         * rather than blocking legitimate users.
         */

        next();

    }

}

/* -------------------------------------------------------------------------- */

module.exports = rateLimit;