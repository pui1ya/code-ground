/**
 * contextBuilder.js
 * ---------------------------------------------------------------
 * Packages the current editor workspace into a structured context
 * object that is sent to the backend AI endpoint.
 *
 * This file DOES NOT build prompts.
 * It only gathers relevant information from the frontend.
 *
 * Flow:
 *
 * Editor.jsx
 *      ↓
 * buildContext(...)
 *      ↓
 * useAI.js
 *      ↓
 * POST /api/ai/ask
 *      ↓
 * backend/contextService.js
 *      ↓
 * Anthropic
 *
 * Keeping prompt construction on the backend means prompts can be
 * improved without shipping a new frontend build.
 */

/* ------------------------------------------------------------------ */
/* Constants */
/* ------------------------------------------------------------------ */

// const MAX_CODE_CHARS = 12000;
// const MAX_OUTPUT_CHARS = 3000;
// const MAX_EDITS = 50;

// /* ------------------------------------------------------------------ */
// /* Helpers */
// /* ------------------------------------------------------------------ */

// function truncate(value = "", max = MAX_CODE_CHARS) {
//   if (typeof value !== "string") return "";

//   if (value.length <= max) return value;

//   return (
//     value.slice(0, max) +
//     `\n\n... (${value.length - max} characters omitted)`
//   );
// }

// function sanitizeTimeline(timeline = []) {
//   if (!Array.isArray(timeline)) return [];

//   return timeline
//     .slice(-MAX_EDITS)
//     .map((event) => ({
//       type: event.type ?? "edit",
//       user: event.user ?? null,
//       timestamp: event.timestamp ?? Date.now(),
//       summary: event.summary ?? null,
//     }));
// }

// function sanitizePresence(users = []) {
//   if (!Array.isArray(users)) return [];

//   return users.map((user) => ({
//     id: user.id,
//     username: user.username,
//     active: !!user.active,
//   }));
// }

// function sanitizeExecution(result) {
//   if (!result) return null;

//   return {
//     success: !!result.success,
//     elapsed_ms: result.elapsed_ms ?? null,
//     stdout: truncate(result.stdout ?? "", MAX_OUTPUT_CHARS),
//     stderr: truncate(result.stderr ?? "", MAX_OUTPUT_CHARS),
//   };
// }

// /* ------------------------------------------------------------------ */
// /* Main Builder */
// /* ------------------------------------------------------------------ */

// export function buildContext({
//   documentId,
//   title,
//   language,
//   code,
//   prompt,

//   timeline = [],
//   collaborators = [],

//   execution = null,

//   sessionSummary = null,

//   selectedText = "",
// }) {
//   return {
//     version: 1,

//     generated_at: new Date().toISOString(),

//     document: {
//       id: documentId,
//       title,
//       language,
//     },

//     editor: {
//       code: truncate(code),
//       selected_text: selectedText || null,
//     },

//     ai: {
//       prompt,
//     },

//     collaboration: {
//       active_users: sanitizePresence(collaborators),
//       recent_edits: sanitizeTimeline(timeline),
//     },

//     execution: sanitizeExecution(execution),

//     session: {
//       summary: sessionSummary,
//     },
//   };
// }

// export default buildContext;

/**
 * contextBuilder.js
 * --------------------------------------------------------------------
 * CodeSync AI Context Builder
 *
 * Purpose
 * -------
 * Collects the current editor workspace into a clean, structured object
 * that is sent to the backend AI endpoint.
 *
 * This file DOES NOT create prompts.
 * Prompt engineering belongs in backend/services/contextService.js.
 *
 * Flow
 * ----
 * Editor.jsx
 *      ↓
 * buildContext()
 *      ↓
 * useAI.js
 *      ↓
 * POST /api/ai/ask
 *      ↓
 * contextService.js
 *      ↓
 * Anthropic
 */

const MAX_CODE_LENGTH = 12000;
const MAX_OUTPUT_LENGTH = 3000;
const MAX_EDIT_EVENTS = 50;

/* ------------------------------------------------------------------ */
/* Helpers */
/* ------------------------------------------------------------------ */

function truncate(text = "", maxLength = MAX_CODE_LENGTH) {
  if (typeof text !== "string") return "";

  if (text.length <= maxLength) {
    return text;
  }

  return (
    text.slice(0, maxLength) +
    `\n\n... (${text.length - maxLength} more characters omitted)`
  );
}

function sanitizePeers(peers = []) {
  if (!Array.isArray(peers)) return [];

  return peers.map((peer) => ({
    id: peer.id ?? null,
    username: peer.username ?? peer.name ?? "Anonymous",
    active: !!peer.active,
  }));
}

function sanitizeTimeline(editLog = []) {
  if (!Array.isArray(editLog)) return [];

  return editLog
    .slice(-MAX_EDIT_EVENTS)
    .map((event) => ({
      type: event.type ?? "edit",
      user: event.user ?? null,
      timestamp: event.timestamp ?? Date.now(),
      summary: event.summary ?? null,
    }));
}

function sanitizeExecution(output) {
  if (!output) return null;

  return {
    success: !!output.success,
    elapsed_ms: output.elapsed_ms ?? null,
    stdout: truncate(output.stdout ?? "", MAX_OUTPUT_LENGTH),
    stderr: truncate(output.stderr ?? "", MAX_OUTPUT_LENGTH),
  };
}

/* ------------------------------------------------------------------ */
/* Main Builder */
/* ------------------------------------------------------------------ */

export default function buildContext({
  doc,
  editor,
  prompt = "",

  peers = [],
  editLog = [],

  output = null,

  sessionSummary = null,
}) {
  const code =
    typeof editor?.getValue === "function"
      ? editor.getValue()
      : "";

  return {
    version: 1,

    generated_at: new Date().toISOString(),

    workspace: {
      id: doc?.id ?? null,
      title: doc?.title ?? "Untitled",
      language: doc?.language ?? "plaintext",
      visibility: doc?.is_public ? "public" : "private",
      owner_id: doc?.owner_id ?? null,
    },

    editor: {
      code: truncate(code),
      selection:
        typeof editor?.getSelection === "function"
          ? editor.getSelection()
          : null,
    },

    collaboration: {
      active_users: sanitizePeers(peers),
      recent_edits: sanitizeTimeline(editLog),
    },

    execution: sanitizeExecution(output),

    session: {
      summary: sessionSummary,
    },

    ai: {
      prompt: prompt.trim(),
    },
  };
}