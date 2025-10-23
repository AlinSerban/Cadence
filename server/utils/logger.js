/**
 * Basic Logging System
 * Structured logging for production monitoring and debugging
 */

import { isProduction, isDevelopment } from './envValidation.js';

// Log levels
const LOG_LEVELS = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3
};

// Current log level based on environment
const CURRENT_LOG_LEVEL = isProduction() ? LOG_LEVELS.INFO : LOG_LEVELS.DEBUG;

// Colors for console output
const COLORS = {
    ERROR: '\x1b[31m', // Red
    WARN: '\x1b[33m',  // Yellow
    INFO: '\x1b[36m',  // Cyan
    DEBUG: '\x1b[90m', // Gray
    RESET: '\x1b[0m'   // Reset
};

/**
 * Format timestamp for logs
 */
function formatTimestamp() {
    return new Date().toISOString();
}

/**
 * Format log message with metadata
 */
function formatLogMessage(level, message, metadata = {}) {
    const timestamp = formatTimestamp();
    const levelUpper = level.toUpperCase();
    const color = COLORS[levelUpper] || COLORS.RESET;
    const reset = COLORS.RESET;

    // Base log entry
    const logEntry = {
        timestamp,
        level: levelUpper,
        message,
        ...metadata
    };

    // Console output with colors
    const consoleMessage = `${color}[${timestamp}] ${levelUpper}: ${message}${reset}`;

    // Add metadata to console if present
    if (Object.keys(metadata).length > 0) {
        console.log(consoleMessage);
        console.log(`${color}  Metadata:${reset}`, metadata);
    } else {
        console.log(consoleMessage);
    }

    return logEntry;
}

/**
 * Core logging function
 */
function log(level, message, metadata = {}) {
    if (LOG_LEVELS[level.toUpperCase()] > CURRENT_LOG_LEVEL) {
        return;
    }

    const logEntry = formatLogMessage(level, message, metadata);

    // In production, you might want to send logs to external services
    if (isProduction()) {
        // TODO: Send to external logging service (e.g., CloudWatch, Loggly, etc.)
        // For now, just console.log
    }

    return logEntry;
}

/**
 * Logger class with structured methods
 */
class Logger {
    constructor(context = '') {
        this.context = context;
    }

    /**
     * Create a child logger with additional context
     */
    child(additionalContext) {
        return new Logger(this.context ? `${this.context}:${additionalContext}` : additionalContext);
    }

    /**
     * Error logging
     */
    error(message, metadata = {}) {
        return log('ERROR', this._formatMessage(message), {
            ...metadata,
            context: this.context
        });
    }

    /**
     * Warning logging
     */
    warn(message, metadata = {}) {
        return log('WARN', this._formatMessage(message), {
            ...metadata,
            context: this.context
        });
    }

    /**
     * Info logging
     */
    info(message, metadata = {}) {
        return log('INFO', this._formatMessage(message), {
            ...metadata,
            context: this.context
        });
    }

    /**
     * Debug logging
     */
    debug(message, metadata = {}) {
        return log('DEBUG', this._formatMessage(message), {
            ...metadata,
            context: this.context
        });
    }

    /**
     * Format message with context
     */
    _formatMessage(message) {
        return this.context ? `[${this.context}] ${message}` : message;
    }

    /**
     * Log HTTP requests
     */
    httpRequest(req, res, responseTime) {
        const metadata = {
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            responseTime: `${responseTime}ms`,
            userAgent: req.get('User-Agent'),
            ip: req.ip || req.connection.remoteAddress
        };

        // Add user ID if available
        if (req.user && req.user.id) {
            metadata.userId = req.user.id;
        }

        // Add request ID if available
        if (req.requestId) {
            metadata.requestId = req.requestId;
        }

        const level = res.statusCode >= 400 ? 'warn' : 'info';
        this[level](`${req.method} ${req.url} ${res.statusCode}`, metadata);
    }

    /**
     * Log database operations
     */
    database(operation, table, duration, metadata = {}) {
        this.debug(`Database ${operation} on ${table}`, {
            operation,
            table,
            duration: `${duration}ms`,
            ...metadata
        });
    }

    /**
     * Log authentication events
     */
    auth(event, userId, metadata = {}) {
        this.info(`Auth ${event}`, {
            event,
            userId,
            ...metadata
        });
    }

    /**
     * Log business logic events
     */
    business(event, metadata = {}) {
        this.info(`Business: ${event}`, metadata);
    }

    /**
     * Log performance metrics
     */
    performance(metric, value, metadata = {}) {
        this.info(`Performance: ${metric}`, {
            metric,
            value,
            ...metadata
        });
    }

    /**
     * Log security events
     */
    security(event, metadata = {}) {
        this.warn(`Security: ${event}`, metadata);
    }
}

/**
 * Create request ID for tracking
 */
function generateRequestId() {
    return Math.random().toString(36).substr(2, 9);
}

/**
 * Express middleware for request logging
 */
function requestLogger(req, res, next) {
    const startTime = Date.now();
    req.requestId = generateRequestId();

    // Log request start
    const logger = new Logger('HTTP');
    logger.debug(`Request started: ${req.method} ${req.url}`, {
        requestId: req.requestId,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent')
    });

    // Override res.end to log response
    const originalEnd = res.end;
    res.end = function (...args) {
        const responseTime = Date.now() - startTime;
        logger.httpRequest(req, res, responseTime);
        originalEnd.apply(this, args);
    };

    next();
}

/**
 * Express middleware for error logging
 */
function errorLogger(err, req, res, next) {
    const logger = new Logger('ERROR');
    logger.error(`Unhandled error: ${err.message}`, {
        requestId: req.requestId,
        method: req.method,
        url: req.url,
        stack: err.stack,
        userId: req.user?.id
    });

    next(err);
}

// Create default logger instance
const logger = new Logger();

// Export everything
export {
    Logger,
    logger,
    requestLogger,
    errorLogger,
    generateRequestId,
    LOG_LEVELS
};

// Export default logger
export default logger;
