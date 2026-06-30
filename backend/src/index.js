/**
 * ============================================================================
 * CodeSync Backend Entry Point
 * ----------------------------------------------------------------------------
 * Responsibilities
 * ----------------
 * • Creates the Express application.
 * • Creates the HTTP server.
 * • Attaches Socket.IO.
 * • Connects PostgreSQL.
 * • Connects Redis.
 * • Registers middleware.
 * • Registers API routes.
 * • Starts listening on port 4000.
 *
 * This file intentionally contains no business logic.
 * ============================================================================
 */

require('dotenv').config();

const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const { Server } = require('socket.io');

/* -------------------------------------------------------------------------- */
/* Database */
/* -------------------------------------------------------------------------- */

const initializeDatabase = require('./db/init');

/* -------------------------------------------------------------------------- */
/* Routes */
/* -------------------------------------------------------------------------- */

const authRoutes = require('./routes/auth');
const documentRoutes = require('./routes/documents');
const aiRoutes = require('./routes/ai');
const executionRoutes = require('./routes/execute');
const billingRoutes = require('./routes/billing');

/* -------------------------------------------------------------------------- */
/* Socket Service */
/* -------------------------------------------------------------------------- */

const initialiseSocketService = require('./services/socketService');

/* -------------------------------------------------------------------------- */

const app = express();

const server = http.createServer(app);

/* -------------------------------------------------------------------------- */
/* Socket.IO */
/* -------------------------------------------------------------------------- */

const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});

/* -------------------------------------------------------------------------- */
/* Middleware */
/* -------------------------------------------------------------------------- */

app.use(cors());

app.use(helmet());

app.use(morgan('dev'));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

/* -------------------------------------------------------------------------- */
/* Health Check */
/* -------------------------------------------------------------------------- */

app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'CodeSync Backend',
        timestamp: new Date().toISOString(),
    });
});

/* -------------------------------------------------------------------------- */
/* API Routes */
/* -------------------------------------------------------------------------- */

app.use('/api/auth', authRoutes);

app.use('/api/documents', documentRoutes);

app.use('/api/ai', aiRoutes);

app.use('/api/execute', executionRoutes);

app.use('/api/billing', billingRoutes);

/* -------------------------------------------------------------------------- */
/* Socket.IO */
/* -------------------------------------------------------------------------- */

initialiseSocketService(io);

/* -------------------------------------------------------------------------- */
/* Error Handler */
/* -------------------------------------------------------------------------- */

app.use((err, req, res, next) => {
    console.error(err);

    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Internal Server Error',
    });
});

/* -------------------------------------------------------------------------- */
/* Start Server */
/* -------------------------------------------------------------------------- */

const PORT = process.env.PORT || 4000;

async function startServer() {
    try {

        await initializeDatabase();

        server.listen(PORT, () => {
            console.log('');
            console.log('========================================');
            console.log('🚀 CodeSync Backend Running');
            console.log(`🌐 http://localhost:${PORT}`);
            console.log('========================================');
            console.log('');
        });

    } catch (error) {

        console.error('Failed to start server');

        console.error(error);

        process.exit(1);

    }
}

startServer();