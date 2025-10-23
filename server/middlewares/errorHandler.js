/**
 * Global Error Handling Middleware
 * Handles all unhandled errors and provides consistent error responses
 */

// Custom error classes for different error types
export class AppError extends Error {
    constructor(message, statusCode, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

        Error.captureStackTrace(this, this.constructor);
    }
}

export class ValidationError extends AppError {
    constructor(message) {
        super(message, 400);
        this.name = 'ValidationError';
    }
}

export class DatabaseError extends AppError {
    constructor(message) {
        super(message, 500);
        this.name = 'DatabaseError';
    }
}

export class AuthenticationError extends AppError {
    constructor(message = 'Authentication failed') {
        super(message, 401);
        this.name = 'AuthenticationError';
    }
}

export class AuthorizationError extends AppError {
    constructor(message = 'Access denied') {
        super(message, 403);
        this.name = 'AuthorizationError';
    }
}

export class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, 404);
        this.name = 'NotFoundError';
    }
}

// Error handling middleware
export const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log error details
    console.error('🚨 Error occurred:', {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
    });

    // Handle specific error types
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message).join(', ');
        error = new ValidationError(message);
    }

    if (err.name === 'CastError') {
        const message = 'Invalid ID format';
        error = new ValidationError(message);
    }

    if (err.code === 11000) {
        const message = 'Duplicate field value';
        error = new ValidationError(message);
    }

    if (err.name === 'JsonWebTokenError') {
        const message = 'Invalid token';
        error = new AuthenticationError(message);
    }

    if (err.name === 'TokenExpiredError') {
        const message = 'Token expired';
        error = new AuthenticationError(message);
    }

    if (err.name === 'SyntaxError' && err.type === 'entity.parse.failed') {
        const message = 'Invalid JSON in request body';
        error = new ValidationError(message);
    }

    // Handle database connection errors
    if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
        const message = 'Database connection failed';
        error = new DatabaseError(message);
    }

    // Handle PostgreSQL specific errors
    if (err.code === '23505') { // Unique constraint violation
        const message = 'Duplicate entry - resource already exists';
        error = new ValidationError(message);
    }

    if (err.code === '23503') { // Foreign key constraint violation
        const message = 'Referenced resource does not exist';
        error = new ValidationError(message);
    }

    if (err.code === '23502') { // Not null constraint violation
        const message = 'Required field is missing';
        error = new ValidationError(message);
    }

    // Default to 500 server error
    if (!error.statusCode) {
        error.statusCode = 500;
        error.status = 'error';
    }

    // Send error response
    const errorResponse = {
        status: error.status,
        message: error.message,
        ...(process.env.NODE_ENV === 'development' && {
            stack: err.stack,
            error: err
        })
    };

    // Don't send stack trace in production
    if (process.env.NODE_ENV === 'production') {
        // Log full error details for monitoring
        console.error('Production Error:', {
            message: error.message,
            statusCode: error.statusCode,
            url: req.url,
            method: req.method,
            timestamp: new Date().toISOString()
        });
    }

    res.status(error.statusCode).json(errorResponse);
};

// Async error wrapper
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

// 404 handler for undefined routes
export const notFoundHandler = (req, res, next) => {
    const error = new NotFoundError(`Route ${req.originalUrl} not found`);
    next(error);
};

// Unhandled promise rejection handler
export const handleUnhandledRejection = () => {
    process.on('unhandledRejection', (err, promise) => {
        console.error('🚨 Unhandled Promise Rejection:', err);
        console.error('Promise:', promise);

        // Close server gracefully
        process.exit(1);
    });
};

// Uncaught exception handler
export const handleUncaughtException = () => {
    process.on('uncaughtException', (err) => {
        console.error('🚨 Uncaught Exception:', err);

        // Close server gracefully
        process.exit(1);
    });
};
