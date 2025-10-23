/**
 * Test script to verify error handling middleware works correctly
 */

import express from 'express';
import { errorHandler, notFoundHandler, AppError, asyncHandler } from './middlewares/errorHandler.js';

const app = express();

// Test routes
app.get('/test-success', (req, res) => {
    res.json({ message: 'Success!' });
});

app.get('/test-error', (req, res) => {
    throw new AppError('Test error', 400);
});

app.get('/test-async-error', asyncHandler(async (req, res) => {
    throw new AppError('Async test error', 500);
}));

app.get('/test-validation', (req, res) => {
    throw new Error('Validation failed');
});

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

const PORT = 3001;

app.listen(PORT, () => {
    console.log(`🧪 Error handling test server running on port ${PORT}`);
    console.log('Test endpoints:');
    console.log(`- GET http://localhost:${PORT}/test-success`);
    console.log(`- GET http://localhost:${PORT}/test-error`);
    console.log(`- GET http://localhost:${PORT}/test-async-error`);
    console.log(`- GET http://localhost:${PORT}/test-validation`);
    console.log(`- GET http://localhost:${PORT}/nonexistent (404 test)`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down test server...');
    process.exit(0);
});
