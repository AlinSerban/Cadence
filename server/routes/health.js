/**
 * Health Check Routes
 * Provides system health status for monitoring and load balancers
 */

import express from 'express';
import { pool } from '../db/db.js';
import { redis } from '../lib/redis.js';
import { getDatabaseConfig, getRedisConfig, isProduction } from '../utils/envValidation.js';
import { asyncHandler, AppError } from '../middlewares/errorHandler.js';

const router = express.Router();

/**
 * Basic health check - quick response for load balancers
 * GET /health
 */
router.get('/', asyncHandler(async (req, res) => {
    const startTime = Date.now();

    const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0',
        responseTime: 0
    };

    health.responseTime = Date.now() - startTime;

    res.status(200).json(health);
}));

/**
 * Detailed health check - includes all system components
 * GET /health/detailed
 */
router.get('/detailed', asyncHandler(async (req, res) => {
    const startTime = Date.now();
    const checks = {
        server: { status: 'healthy', responseTime: 0 },
        database: { status: 'unknown', responseTime: 0, error: null },
        redis: { status: 'unknown', responseTime: 0, error: null },
        memory: { status: 'healthy', usage: {} },
        disk: { status: 'healthy', usage: {} }
    };

    // Server check
    checks.server.responseTime = Date.now() - startTime;

    // Database check
    try {
        const dbStart = Date.now();
        const dbConfig = getDatabaseConfig();

        if (!dbConfig.url) {
            throw new Error('Database URL not configured');
        }

        const result = await pool.query('SELECT 1 as health_check');
        checks.database.status = 'healthy';
        checks.database.responseTime = Date.now() - dbStart;
        checks.database.details = {
            connected: true,
            url: dbConfig.url.replace(/\/\/.*@/, '//***:***@'), // Hide credentials
            sslMode: dbConfig.sslMode
        };
    } catch (error) {
        checks.database.status = 'unhealthy';
        checks.database.error = error.message;
        checks.database.responseTime = Date.now() - startTime;
    }

    // Redis check
    try {
        const redisStart = Date.now();
        const redisConfig = getRedisConfig();

        if (!redisConfig.url) {
            throw new Error('Redis URL not configured');
        }

        await redis.ping();
        checks.redis.status = 'healthy';
        checks.redis.responseTime = Date.now() - redisStart;
        checks.redis.details = {
            connected: true,
            url: redisConfig.url,
            tls: redisConfig.tls
        };
    } catch (error) {
        checks.redis.status = 'unhealthy';
        checks.redis.error = error.message;
        checks.redis.responseTime = Date.now() - startTime;
    }

    // Memory usage check
    const memUsage = process.memoryUsage();
    const memUsageMB = {
        rss: Math.round(memUsage.rss / 1024 / 1024),
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
        external: Math.round(memUsage.external / 1024 / 1024)
    };

    checks.memory.usage = memUsageMB;

    // Check if memory usage is too high (warning at 80% of 512MB)
    const maxMemoryMB = 512;
    const memoryUsagePercent = (memUsageMB.heapUsed / maxMemoryMB) * 100;

    if (memoryUsagePercent > 90) {
        checks.memory.status = 'critical';
    } else if (memoryUsagePercent > 80) {
        checks.memory.status = 'warning';
    }

    // Overall health status
    const overallStatus = Object.values(checks).every(check =>
        check.status === 'healthy' || check.status === 'warning'
    ) ? 'healthy' : 'unhealthy';

    const response = {
        status: overallStatus,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0',
        totalResponseTime: Date.now() - startTime,
        checks
    };

    const statusCode = overallStatus === 'healthy' ? 200 : 503;
    res.status(statusCode).json(response);
}));

/**
 * Database-specific health check
 * GET /health/database
 */
router.get('/database', asyncHandler(async (req, res) => {
    const startTime = Date.now();

    try {
        const dbConfig = getDatabaseConfig();

        if (!dbConfig.url) {
            throw new AppError('Database URL not configured', 500);
        }

        // Test basic connectivity
        const result = await pool.query('SELECT 1 as health_check, NOW() as server_time');

        // Test a more complex query
        const tableCheck = await pool.query(`
      SELECT 
        table_name,
        table_type
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      LIMIT 5
    `);

        const response = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            responseTime: Date.now() - startTime,
            database: {
                connected: true,
                url: dbConfig.url.replace(/\/\/.*@/, '//***:***@'),
                sslMode: dbConfig.sslMode,
                serverTime: result.rows[0].server_time,
                tablesFound: tableCheck.rows.length
            }
        };

        res.status(200).json(response);
    } catch (error) {
        const response = {
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            responseTime: Date.now() - startTime,
            error: error.message,
            database: {
                connected: false,
                error: error.message
            }
        };

        res.status(503).json(response);
    }
}));

/**
 * Redis-specific health check
 * GET /health/redis
 */
router.get('/redis', asyncHandler(async (req, res) => {
    const startTime = Date.now();

    try {
        const redisConfig = getRedisConfig();

        if (!redisConfig.url) {
            throw new AppError('Redis URL not configured', 500);
        }

        // Test basic connectivity
        const pong = await redis.ping();

        // Test set/get operations
        const testKey = 'health_check_test';
        const testValue = Date.now().toString();

        await redis.set(testKey, testValue, 'EX', 10); // 10 second expiry
        const retrievedValue = await redis.get(testKey);
        await redis.del(testKey); // Clean up

        const response = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            responseTime: Date.now() - startTime,
            redis: {
                connected: true,
                url: redisConfig.url,
                tls: redisConfig.tls,
                ping: pong,
                readWriteTest: retrievedValue === testValue
            }
        };

        res.status(200).json(response);
    } catch (error) {
        const response = {
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            responseTime: Date.now() - startTime,
            error: error.message,
            redis: {
                connected: false,
                error: error.message
            }
        };

        res.status(503).json(response);
    }
}));

/**
 * Readiness check - for Kubernetes readiness probes
 * GET /health/ready
 */
router.get('/ready', asyncHandler(async (req, res) => {
    try {
        // Check if all critical services are ready
        const dbResult = await pool.query('SELECT 1');
        await redis.ping();

        res.status(200).json({
            status: 'ready',
            timestamp: new Date().toISOString(),
            services: {
                database: 'ready',
                redis: 'ready'
            }
        });
    } catch (error) {
        res.status(503).json({
            status: 'not_ready',
            timestamp: new Date().toISOString(),
            error: error.message
        });
    }
}));

/**
 * Liveness check - for Kubernetes liveness probes
 * GET /health/live
 */
router.get('/live', (req, res) => {
    res.status(200).json({
        status: 'alive',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        pid: process.pid
    });
});

/**
 * Metrics endpoint - for monitoring systems
 * GET /health/metrics
 */
router.get('/metrics', asyncHandler(async (req, res) => {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    const metrics = {
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: {
            rss: Math.round(memUsage.rss / 1024 / 1024), // MB
            heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
            heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
            external: Math.round(memUsage.external / 1024 / 1024)
        },
        cpu: {
            user: cpuUsage.user,
            system: cpuUsage.system
        },
        process: {
            pid: process.pid,
            version: process.version,
            platform: process.platform,
            arch: process.arch
        },
        environment: {
            nodeEnv: process.env.NODE_ENV || 'development',
            appEnv: process.env.APP_ENV || 'dev'
        }
    };

    res.status(200).json(metrics);
}));

export default router;
