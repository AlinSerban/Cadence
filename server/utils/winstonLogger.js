/**
 * Winston Logging System
 * Production-ready logging with file rotation, structured output, and multiple transports
 */

import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { isProduction, isDevelopment } from './envValidation.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Custom log format for console output
const consoleFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.colorize(),
    winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
        const contextStr = context ? `[${context}]` : '';
        const metaStr = Object.keys(meta).length > 0 ? `\n  Metadata: ${JSON.stringify(meta, null, 2)}` : '';
        return `${timestamp} ${level}: ${contextStr} ${message}${metaStr}`;
    })
);

// Custom log format for file output
const fileFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
);

// Create logs directory
const logsDir = join(__dirname, '..', 'logs');

// Define log levels
const logLevels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4
};

// Define log colors
const logColors = {
    error: 'red',
    warn: 'yellow',
    info: 'cyan',
    http: 'magenta',
    debug: 'gray'
};

winston.addColors(logColors);

/**
 * Create Winston logger instance
 */
function createWinstonLogger() {
    const transports = [];

    // Console transport (always enabled)
    transports.push(
        new winston.transports.Console({
            level: isProduction() ? 'info' : 'debug',
            format: consoleFormat,
            handleExceptions: true,
            handleRejections: true
        })
    );

    // File transports (production only or when explicitly enabled)
    if (isProduction() || process.env.ENABLE_FILE_LOGGING === 'true') {
        // Error log file
        transports.push(
            new DailyRotateFile({
                filename: join(logsDir, 'error-%DATE%.log'),
                datePattern: 'YYYY-MM-DD',
                level: 'error',
                format: fileFormat,
                maxSize: '20m',
                maxFiles: '14d',
                zippedArchive: true
            })
        );

        // Combined log file
        transports.push(
            new DailyRotateFile({
                filename: join(logsDir, 'combined-%DATE%.log'),
                datePattern: 'YYYY-MM-DD',
                format: fileFormat,
                maxSize: '20m',
                maxFiles: '14d',
                zippedArchive: true
            })
        );

        // HTTP access log
        transports.push(
            new DailyRotateFile({
                filename: join(logsDir, 'access-%DATE%.log'),
                datePattern: 'YYYY-MM-DD',
                level: 'http',
                format: fileFormat,
                maxSize: '20m',
                maxFiles: '7d',
                zippedArchive: true
            })
        );

        // Application log (info and above)
        transports.push(
            new DailyRotateFile({
                filename: join(logsDir, 'app-%DATE%.log'),
                datePattern: 'YYYY-MM-DD',
                level: 'info',
                format: fileFormat,
                maxSize: '20m',
                maxFiles: '30d',
                zippedArchive: true
            })
        );
    }

    return winston.createLogger({
        level: isProduction() ? 'info' : 'debug',
        levels: logLevels,
        format: fileFormat,
        transports,
        exitOnError: false,
        silent: process.env.NODE_ENV === 'test'
    });
}

/**
 * Enhanced logger class with Winston backend
 */
class WinstonLogger {
    constructor(context = '') {
        this.context = context;
        this.winston = createWinstonLogger();
    }

    /**
     * Create a child logger with additional context
     */
    child(additionalContext) {
        return new WinstonLogger(this.context ? `${this.context}:${additionalContext}` : additionalContext);
    }

    /**
     * Log with context and metadata
     */
    _log(level, message, metadata = {}) {
        const logData = {
            message,
            context: this.context,
            ...metadata
        };

        this.winston.log(level, message, logData);
    }

    /**
     * Error logging
     */
    error(message, metadata = {}) {
        this._log('error', message, metadata);
    }

    /**
     * Warning logging
     */
    warn(message, metadata = {}) {
        this._log('warn', message, metadata);
    }

    /**
     * Info logging
     */
    info(message, metadata = {}) {
        this._log('info', message, metadata);
    }

    /**
     * Debug logging
     */
    debug(message, metadata = {}) {
        this._log('debug', message, metadata);
    }

    /**
     * HTTP request logging
     */
    http(message, metadata = {}) {
        this._log('http', message, metadata);
    }

    /**
     * Log HTTP requests with enhanced metadata
     */
    httpRequest(req, res, responseTime) {
        const metadata = {
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            responseTime: `${responseTime}ms`,
            userAgent: req.get('User-Agent'),
            ip: req.ip || req.connection.remoteAddress,
            contentLength: res.get('Content-Length') || 0
        };

        // Add user ID if available
        if (req.user && req.user.id) {
            metadata.userId = req.user.id;
        }

        // Add request ID if available
        if (req.requestId) {
            metadata.requestId = req.requestId;
        }

        // Add session info
        if (req.sessionID) {
            metadata.sessionId = req.sessionID;
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

    /**
     * Log system events
     */
    system(event, metadata = {}) {
        this.info(`System: ${event}`, metadata);
    }

    /**
     * Log startup events
     */
    startup(event, metadata = {}) {
        this.info(`Startup: ${event}`, metadata);
    }

    /**
     * Log shutdown events
     */
    shutdown(event, metadata = {}) {
        this.info(`Shutdown: ${event}`, metadata);
    }
}

// Create default logger instance
const winstonLogger = new WinstonLogger();

// Export everything
export {
    WinstonLogger,
    winstonLogger,
    createWinstonLogger
};

// Export default logger
export default winstonLogger;
