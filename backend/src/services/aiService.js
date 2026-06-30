/**
 * ============================================================================
 * aiService.js
 * ----------------------------------------------------------------------------
 * CodeSync AI Service (Gemini)
 *
 * Responsibilities
 * ----------------
 * • Build the complete prompt.
 * • Merge editor context.
 * • Call Gemini.
 * • Stream generated text back through callbacks.
 * • Hide Gemini implementation from the rest of the backend.
 *
 * Routes should never know which LLM provider is used.
 * ============================================================================
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");

/* -------------------------------------------------------------------------- */
/* Gemini                                                                      */
/* -------------------------------------------------------------------------- */

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
});

/* -------------------------------------------------------------------------- */
/* System Prompt                                                               */
/* -------------------------------------------------------------------------- */

const SYSTEM_PROMPT = `
You are CodeGround AI.

You are an expert software engineer helping users inside a collaborative IDE.

Rules:

• Produce production-quality code.
• Never invent APIs.
• Preserve existing architecture.
• Explain fixes before code.
• Prefer minimal edits.
• Respect supplied project context.
• Output Markdown.
`.trim();

/* -------------------------------------------------------------------------- */
/* Prompt Builder                                                              */
/* -------------------------------------------------------------------------- */

function buildPrompt({

    prompt,

    context,

    language,

    documentId,

}) {

    return `
${SYSTEM_PROMPT}

==============================
DOCUMENT
==============================

Document ID:
${documentId ?? "Unknown"}

Language:
${language ?? "Unknown"}

==============================
EDITOR CONTEXT
==============================

${context ?? "No context provided."}

==============================
USER REQUEST
==============================

${prompt}
`;

}

/* -------------------------------------------------------------------------- */
/* Stream Completion                                                           */
/* -------------------------------------------------------------------------- */

async function streamCompletion({

    prompt,

    context,

    language,

    documentId,

    onToken,

    onComplete,

    onError,

}) {

    try {

        const finalPrompt = buildPrompt({

            prompt,

            context,

            language,

            documentId,

        });

        /*
         * The current Node SDK is non-streaming.
         * We simulate streaming by progressively emitting words.
         *
         * Later this block can be replaced with true Gemini streaming
         * without changing routes/ai.js.
         */

        const result = await model.generateContent(finalPrompt);

        const response = result.response.text();

        const words = response.split(" ");

        let fullResponse = "";

        for (const word of words) {

            const token = word + " ";

            fullResponse += token;

            onToken(token);

            await sleep(18);

        }

        onComplete(fullResponse.trim());

    }

    catch (err) {

        console.error(err);

        onError(err);

    }

}

/* -------------------------------------------------------------------------- */

function sleep(ms) {

    return new Promise(resolve => setTimeout(resolve, ms));

}

/* -------------------------------------------------------------------------- */

module.exports = {

    streamCompletion,

};