/**
 * ============================================================================
 * socketService.js
 * ----------------------------------------------------------------------------
 * CodeSync Socket.IO Service
 *
 * Responsibilities
 * ----------------
 * • Manage collaborative editing sessions.
 * • Track active users.
 * • Broadcast code changes.
 * • Broadcast cursor positions.
 * • Broadcast document presence.
 * • Maintain lightweight runtime state.
 * * Future:
 *   - Persist session metadata.
 *   - Flush runtime state to database.
 * ============================================================================
 */

const activeDocuments = new Map();

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function getRoom(documentId) {

    if (!activeDocuments.has(documentId)) {

        activeDocuments.set(documentId, {
            users: new Map(),
            edits: [],
        });

    }

    return activeDocuments.get(documentId);

}

/* -------------------------------------------------------------------------- */
/* Main Socket Service                                                        */
/* -------------------------------------------------------------------------- */

function initialiseSocketService(io) {

    io.on('connection', (socket) => {

        console.log(`Socket Connected: ${socket.id}`);

        /* ------------------------------------------------------------------ */
        /* Join Document                                                      */
        /* ------------------------------------------------------------------ */

        socket.on('document:join', ({ documentId, user }) => {

            socket.join(documentId);

            socket.documentId = documentId;

            socket.user = user;

            const room = getRoom(documentId);

            room.users.set(socket.id, user);

            io.to(documentId).emit(
                'presence:update',
                Array.from(room.users.values())
            );

        });

        /* ------------------------------------------------------------------ */
        /* Leave Document                                                     */
        /* ------------------------------------------------------------------ */

        socket.on('document:leave', () => {

            leaveDocument(socket, io);

        });

        /* ------------------------------------------------------------------ */
        /* Code Changes                                                       */
        /* ------------------------------------------------------------------ */

        socket.on('editor:update', (payload) => {

            if (!socket.documentId) return;

            const room = getRoom(socket.documentId);

            room.edits.push({

                timestamp: Date.now(),

                user: socket.user,

                type: 'edit',

            });

            socket.to(socket.documentId).emit(

                'editor:update',

                payload

            );

        });

        /* ------------------------------------------------------------------ */
        /* Cursor Movement                                                    */
        /* ------------------------------------------------------------------ */

        socket.on('cursor:update', (cursor) => {

            if (!socket.documentId) return;

            socket.to(socket.documentId).emit(

                'cursor:update',

                {

                    user: socket.user,

                    cursor,

                }

            );

        });

        /* ------------------------------------------------------------------ */
        /* Typing Indicator                                                   */
        /* ------------------------------------------------------------------ */

        socket.on('typing', (typing) => {

            if (!socket.documentId) return;

            socket.to(socket.documentId).emit(

                'typing',

                {

                    user: socket.user,

                    typing,

                }

            );

        });

        /* ------------------------------------------------------------------ */
        /* Snapshots                                                          */
        /* ------------------------------------------------------------------ */

        socket.on('snapshot:created', (snapshot) => {

            if (!socket.documentId) return;

            io.to(socket.documentId).emit(

                'snapshot:created',

                snapshot

            );

        });

        /* ------------------------------------------------------------------ */
        /* Disconnect                                                         */
        /* ------------------------------------------------------------------ */

        socket.on('disconnect', () => {

            leaveDocument(socket, io);

            console.log(`Socket Disconnected: ${socket.id}`);

        });

    });

}

/* -------------------------------------------------------------------------- */
/* Cleanup                                                                     */
/* -------------------------------------------------------------------------- */

function leaveDocument(socket, io) {

    const documentId = socket.documentId;

    if (!documentId) return;

    const room = activeDocuments.get(documentId);

    if (!room) return;

    room.users.delete(socket.id);

    io.to(documentId).emit(

        'presence:update',

        Array.from(room.users.values())

    );

    /*
     * Future:
     * Persist runtime collaboration state to PostgreSQL.
     * Persist edit timeline.
     * Generate AI session summary.
     */

    if (room.users.size === 0) {

        activeDocuments.delete(documentId);

    }

}

/* -------------------------------------------------------------------------- */

module.exports = initialiseSocketService;