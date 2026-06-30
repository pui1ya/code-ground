/**
 * ============================================================================
 * contextService.js
 * ----------------------------------------------------------------------------
 * CodeSync Context Service
 *
 * Responsibilities
 * ----------------
 * • Validate frontend context.
 * • Merge editor buffers.
 * • Merge edit history.
 * • Merge user selections.
 * • Compress oversized payloads.
 * • Produce a clean prompt context for aiService.
 *
 * This service intentionally knows nothing about Express,
 * Socket.IO or Gemini.
 * ============================================================================
 */

const MAX_CODE_CHARS = 12000;
const MAX_TIMELINE_EVENTS = 50;
const MAX_SELECTION_CHARS = 4000;

/* -------------------------------------------------------------------------- */
/* Public API                                                                 */
/* -------------------------------------------------------------------------- */

function buildContext(payload = {}) {

    return {

        document: buildDocument(payload),

        editor: buildEditor(payload),

        timeline: buildTimeline(payload),

        selection: buildSelection(payload),

        collaborators: buildCollaborators(payload),

        metadata: buildMetadata(payload),

    };

}

/* -------------------------------------------------------------------------- */
/* Document                                                                    */
/* -------------------------------------------------------------------------- */

function buildDocument(payload) {

    return {

        id: payload.documentId ?? null,

        language: payload.language ?? "text",

        title: payload.title ?? "Untitled",

        code: trimCode(payload.code ?? ""),

    };

}

/* -------------------------------------------------------------------------- */
/* Editor                                                                      */
/* -------------------------------------------------------------------------- */

function buildEditor(payload) {

    return {

        cursor: payload.cursor ?? null,

        scrollTop: payload.scrollTop ?? 0,

        activeFile: payload.activeFile ?? null,

    };

}

/* -------------------------------------------------------------------------- */
/* Timeline                                                                    */
/* -------------------------------------------------------------------------- */

function buildTimeline(payload) {

    if (!Array.isArray(payload.timeline)) {

        return [];

    }

    return payload.timeline

        .slice(-MAX_TIMELINE_EVENTS)

        .map(event => ({

            type: event.type,

            timestamp: event.timestamp,

            summary: event.summary,

        }));

}

/* -------------------------------------------------------------------------- */
/* Selection                                                                   */
/* -------------------------------------------------------------------------- */

function buildSelection(payload) {

    if (!payload.selection) {

        return "";

    }

    return payload.selection.slice(0, MAX_SELECTION_CHARS);

}

/* -------------------------------------------------------------------------- */
/* Collaborators                                                               */
/* -------------------------------------------------------------------------- */

function buildCollaborators(payload) {

    if (!Array.isArray(payload.collaborators)) {

        return [];

    }

    return payload.collaborators.map(user => ({

        id: user.id,

        username: user.username,

        active: !!user.active,

    }));

}

/* -------------------------------------------------------------------------- */
/* Metadata                                                                    */
/* -------------------------------------------------------------------------- */

function buildMetadata(payload) {

    return {

        generatedAt: new Date().toISOString(),

        frontendVersion: payload.version ?? "unknown",

        platform: payload.platform ?? "web",

    };

}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */

function trimCode(code) {

    if (code.length <= MAX_CODE_CHARS) {

        return code;

    }

    return code.slice(code.length - MAX_CODE_CHARS);

}

/* -------------------------------------------------------------------------- */

module.exports = {

    buildContext,

};