/**
 * ============================================================================
 * billing.js
 * ----------------------------------------------------------------------------
 * CodeSync Billing Routes
 *
 * Responsibilities
 * ----------------
 * • Create Stripe Checkout sessions.
 * • Handle successful upgrades.
 * • Receive Stripe webhooks.
 * • Upgrade users to Pro.
 *
 * Database updates will later be implemented using db/queries.js.
 * ============================================================================
 */

const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/auth");

/* -------------------------------------------------------------------------- */
/* POST /api/billing/create-checkout-session                                  */
/* -------------------------------------------------------------------------- */

router.post(
    "/create-checkout-session",
    authMiddleware,
    async (req, res, next) => {

        try {

            /*
             * TODO:
             * Replace with Stripe Checkout session creation.
             */

            return res.json({

                success: true,

                checkoutUrl:
                    "https://checkout.stripe.com/mock-session",

                message:
                    "Stripe integration not yet enabled.",

            });

        }

        catch (err) {

            next(err);

        }

    }
);

/* -------------------------------------------------------------------------- */
/* POST /api/billing/webhook                                                  */
/* -------------------------------------------------------------------------- */

router.post(
    "/webhook",
    express.raw({ type: "application/json" }),
    async (req, res, next) => {

        try {

            /*
             * TODO:
             * Verify Stripe signature.
             * Process checkout.session.completed.
             * Upgrade user to Pro.
             */

            console.log("Received Stripe webhook.");

            return res.json({

                received: true,

            });

        }

        catch (err) {

            next(err);

        }

    }
);

/* -------------------------------------------------------------------------- */
/* GET /api/billing/status                                                    */
/* -------------------------------------------------------------------------- */

router.get(
    "/status",
    authMiddleware,
    async (req, res, next) => {

        try {

            return res.json({

                success: true,

                is_paid: req.user?.is_paid ?? false,

            });

        }

        catch (err) {

            next(err);

        }

    }
);

module.exports = router;