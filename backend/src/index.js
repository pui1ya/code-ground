/**
 * ---------------------------------------------------------
 * Code Ground
 * Backend Entry Point
 * ---------------------------------------------------------
 */

import app from "./app.js";
import env from "./config/env.js";

const PORT = env.PORT;

app.listen(PORT, () => {
    console.log(`
==========================================
🚀 Code Ground Backend Started
==========================================
Environment : ${env.NODE_ENV}
Port        : ${PORT}
Frontend    : ${env.FRONTEND_URL}
==========================================
`);
});