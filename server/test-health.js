/**
 * Test script to verify health check endpoints work correctly
 */

import express from 'express';
import { healthRouter } from './routes/health.js';

const app = express();

// Add health routes
app.use('/health', healthRouter);

// Basic test route
app.get('/test', (req, res) => {
    res.json({ message: 'Health check test server is running' });
});

const PORT = 3002;

app.listen(PORT, () => {
    console.log(`🏥 Health check test server running on port ${PORT}`);
    console.log('Test endpoints:');
    console.log(`- GET http://localhost:${PORT}/health`);
    console.log(`- GET http://localhost:${PORT}/health/detailed`);
    console.log(`- GET http://localhost:${PORT}/health/database`);
    console.log(`- GET http://localhost:${PORT}/health/redis`);
    console.log(`- GET http://localhost:${PORT}/health/ready`);
    console.log(`- GET http://localhost:${PORT}/health/live`);
    console.log(`- GET http://localhost:${PORT}/health/metrics`);
    console.log(`- GET http://localhost:${PORT}/test`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down health test server...');
    process.exit(0);
});
