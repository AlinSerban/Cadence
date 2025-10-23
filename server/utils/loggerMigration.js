/**
 * Logger Migration Script
 * Migrates from basic console logging to Winston logging
 */

import { winstonLogger } from './winstonLogger.js';
import { logger as basicLogger } from './logger.js';

// Create a hybrid logger that uses Winston but maintains the same interface
class HybridLogger {
    constructor(context = '') {
        this.context = context;
        this.winston = winstonLogger.child(context);
        this.basic = basicLogger.child(context);
    }

    child(additionalContext) {
        return new HybridLogger(this.context ? `${this.context}:${additionalContext}` : additionalContext);
    }

    error(message, metadata = {}) {
        this.winston.error(message, metadata);
    }

    warn(message, metadata = {}) {
        this.winston.warn(message, metadata);
    }

    info(message, metadata = {}) {
        this.winston.info(message, metadata);
    }

    debug(message, metadata = {}) {
        this.winston.debug(message, metadata);
    }

    http(message, metadata = {}) {
        this.winston.http(message, metadata);
    }

    httpRequest(req, res, responseTime) {
        this.winston.httpRequest(req, res, responseTime);
    }

    database(operation, table, duration, metadata = {}) {
        this.winston.database(operation, table, duration, metadata);
    }

    auth(event, userId, metadata = {}) {
        this.winston.auth(event, userId, metadata);
    }

    business(event, metadata = {}) {
        this.winston.business(event, metadata);
    }

    performance(metric, value, metadata = {}) {
        this.winston.performance(metric, value, metadata);
    }

    security(event, metadata = {}) {
        this.winston.security(event, metadata);
    }

    system(event, metadata = {}) {
        this.winston.system(event, metadata);
    }

    startup(event, metadata = {}) {
        this.winston.startup(event, metadata);
    }

    shutdown(event, metadata = {}) {
        this.winston.shutdown(event, metadata);
    }
}

// Create hybrid logger instance
const hybridLogger = new HybridLogger();

export { HybridLogger, hybridLogger };
export default hybridLogger;
