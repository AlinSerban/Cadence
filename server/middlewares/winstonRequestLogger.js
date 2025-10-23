/**
 * Winston Request Logger Middleware
 * Enhanced request logging with Winston
 */

import { winstonLogger } from '../utils/winstonLogger.js';
import { generateRequestId } from '../utils/logger.js';

/**
 * Winston-based request logging middleware
 */
export function winstonRequestLogger(req, res, next) {
    const startTime = Date.now();
    req.requestId = generateRequestId();

    const logger = winstonLogger.child('HTTP');

    // Log request start
    logger.http('Request started', {
        requestId: req.requestId,
        method: req.method,
        url: req.url,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        contentType: req.get('Content-Type'),
        contentLength: req.get('Content-Length')
    });

    // Override res.end to log response
    const originalEnd = res.end;
    res.end = function (...args) {
        const responseTime = Date.now() - startTime;

        // Enhanced response logging
        const responseData = {
            requestId: req.requestId,
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            responseTime: `${responseTime}ms`,
            contentLength: res.get('Content-Length') || 0,
            userAgent: req.get('User-Agent'),
            ip: req.ip || req.connection.remoteAddress
        };

        // Add user context if available
        if (req.user && req.user.id) {
            responseData.userId = req.user.id;
        }

        // Add session info if available
        if (req.sessionID) {
            responseData.sessionId = req.sessionID;
        }

        // Add query parameters for GET requests
        if (req.method === 'GET' && Object.keys(req.query).length > 0) {
            responseData.query = req.query;
        }

        // Add request body for POST/PUT requests (sanitized)
        if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
            responseData.bodySize = JSON.stringify(req.body).length;
            // Don't log sensitive data
            if (req.body.password) {
                responseData.bodySize = '***';
            }
        }

        // Log with appropriate level
        const level = res.statusCode >= 500 ? 'error' :
            res.statusCode >= 400 ? 'warn' : 'info';

        logger[level](`${req.method} ${req.url} ${res.statusCode}`, responseData);

        originalEnd.apply(this, args);
    };

    next();
}

/**
 * Winston-based error logging middleware
 */
export function winstonErrorLogger(err, req, res, next) {
    const logger = winstonLogger.child('ERROR');

    logger.error('Unhandled error in request', {
        requestId: req.requestId,
        method: req.method,
        url: req.url,
        error: err.message,
        stack: err.stack,
        userId: req.user?.id,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent')
    });

    next(err);
}
