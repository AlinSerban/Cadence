/**
 * Database Migration Runner
 * Handles running migrations in order and tracking migration state
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import { Pool } from 'pg';
import { createHash } from 'crypto';
import { logger } from '../utils/logger.js';
import { getDatabaseConfig } from '../utils/envValidation.js';

class MigrationRunner {
    constructor() {
        this.migrationLogger = logger.child('MIGRATION');
        this.pool = null;
    }

    /**
     * Initialize database connection
     */
    async initialize() {
        const dbConfig = getDatabaseConfig();

        if (!dbConfig.url) {
            throw new Error('DATABASE_URL not configured');
        }

        let config;
        try {
            const url = new URL(dbConfig.url);
            config = {
                user: decodeURIComponent(url.username || ''),
                password: String(decodeURIComponent(url.password || '')),
                host: url.hostname,
                port: Number(url.port || 5432),
                database: url.pathname.replace(/^\//, ''),
            };

            if (dbConfig.sslMode === 'require') {
                config.ssl = { rejectUnauthorized: false };
            }
        } catch (error) {
            this.migrationLogger.error('Invalid DATABASE_URL', { error: error.message });
            throw error;
        }

        this.pool = new Pool(config);

        // Test connection
        try {
            await this.pool.query('SELECT 1');
            this.migrationLogger.info('Database connection established');
        } catch (error) {
            this.migrationLogger.error('Failed to connect to database', { error: error.message });
            throw error;
        }
    }

    /**
     * Create migrations table if it doesn't exist
     */
    async createMigrationsTable() {
        const createTableSQL = `
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        checksum VARCHAR(64),
        execution_time_ms INTEGER
      );
    `;

        await this.pool.query(createTableSQL);
        this.migrationLogger.debug('Migrations table ensured');
    }

    /**
     * Get list of migration files in order
     */
    getMigrationFiles() {
        const migrationsDir = join(process.cwd(), 'db', 'migrations');

        try {
            const files = readdirSync(migrationsDir)
                .filter(file => extname(file) === '.sql')
                .sort(); // Sort alphabetically to ensure order

            this.migrationLogger.debug('Found migration files', { count: files.length, files });
            return files;
        } catch (error) {
            this.migrationLogger.error('Failed to read migrations directory', { error: error.message });
            throw error;
        }
    }

    /**
     * Get executed migrations from database
     */
    async getExecutedMigrations() {
        try {
            const result = await this.pool.query('SELECT filename FROM migrations ORDER BY id');
            return result.rows.map(row => row.filename);
        } catch (error) {
            this.migrationLogger.error('Failed to get executed migrations', { error: error.message });
            throw error;
        }
    }

    /**
     * Calculate file checksum
     */
    calculateChecksum(content) {
        return createHash('sha256').update(content).digest('hex');
    }

    /**
     * Execute a single migration
     */
    async executeMigration(filename) {
        const startTime = Date.now();
        const migrationPath = join(process.cwd(), 'db', 'migrations', filename);

        try {
            this.migrationLogger.info('Executing migration', { filename });

            // Read migration file
            const migrationSQL = readFileSync(migrationPath, 'utf8');
            const checksum = this.calculateChecksum(migrationSQL);

            // Check if migration was already executed with different content
            const existingResult = await this.pool.query(
                'SELECT checksum FROM migrations WHERE filename = $1',
                [filename]
            );

            if (existingResult.rows.length > 0) {
                const existingChecksum = existingResult.rows[0].checksum;
                if (existingChecksum !== checksum) {
                    this.migrationLogger.warn('Migration content changed', {
                        filename,
                        oldChecksum: existingChecksum,
                        newChecksum: checksum
                    });
                }
            }

            // Execute migration in a transaction
            await this.pool.query('BEGIN');

            try {
                await this.pool.query(migrationSQL);

                const executionTime = Date.now() - startTime;

                // Record migration execution
                await this.pool.query(
                    `INSERT INTO migrations (filename, checksum, execution_time_ms) 
           VALUES ($1, $2, $3) 
           ON CONFLICT (filename) 
           DO UPDATE SET 
             checksum = EXCLUDED.checksum,
             executed_at = CURRENT_TIMESTAMP,
             execution_time_ms = EXCLUDED.execution_time_ms`,
                    [filename, checksum, executionTime]
                );

                await this.pool.query('COMMIT');

                this.migrationLogger.info('Migration completed', {
                    filename,
                    executionTime: `${executionTime}ms`
                });

                return { success: true, executionTime };
            } catch (error) {
                await this.pool.query('ROLLBACK');
                throw error;
            }
        } catch (error) {
            this.migrationLogger.error('Migration failed', {
                filename,
                error: error.message,
                stack: error.stack
            });
            throw error;
        }
    }

    /**
     * Run all pending migrations
     */
    async runMigrations() {
        try {
            await this.initialize();
            await this.createMigrationsTable();

            const migrationFiles = this.getMigrationFiles();
            const executedMigrations = await this.getExecutedMigrations();

            const pendingMigrations = migrationFiles.filter(
                file => !executedMigrations.includes(file)
            );

            if (pendingMigrations.length === 0) {
                this.migrationLogger.info('No pending migrations');
                return { executed: 0, total: migrationFiles.length };
            }

            this.migrationLogger.info('Running pending migrations', {
                pending: pendingMigrations.length,
                total: migrationFiles.length
            });

            let executedCount = 0;
            const results = [];

            for (const filename of pendingMigrations) {
                try {
                    const result = await this.executeMigration(filename);
                    results.push({ filename, ...result });
                    executedCount++;
                } catch (error) {
                    this.migrationLogger.error('Migration execution failed', {
                        filename,
                        error: error.message
                    });
                    throw error;
                }
            }

            this.migrationLogger.info('All migrations completed', {
                executed: executedCount,
                total: migrationFiles.length
            });

            return { executed: executedCount, total: migrationFiles.length, results };
        } catch (error) {
            this.migrationLogger.error('Migration runner failed', { error: error.message });
            throw error;
        } finally {
            if (this.pool) {
                await this.pool.end();
            }
        }
    }

    /**
     * Check migration status
     */
    async checkStatus() {
        try {
            await this.initialize();
            await this.createMigrationsTable();

            const migrationFiles = this.getMigrationFiles();
            const executedMigrations = await this.getExecutedMigrations();

            const status = {
                total: migrationFiles.length,
                executed: executedMigrations.length,
                pending: migrationFiles.length - executedMigrations.length,
                migrations: []
            };

            for (const filename of migrationFiles) {
                const isExecuted = executedMigrations.includes(filename);
                status.migrations.push({
                    filename,
                    executed: isExecuted,
                    status: isExecuted ? 'completed' : 'pending'
                });
            }

            return status;
        } catch (error) {
            this.migrationLogger.error('Failed to check migration status', { error: error.message });
            throw error;
        } finally {
            if (this.pool) {
                await this.pool.end();
            }
        }
    }
}

export { MigrationRunner };
