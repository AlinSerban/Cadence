#!/usr/bin/env node

/**
 * Deployment Script
 * Ensures database is ready and runs migrations before deployment
 */

import { MigrationRunner } from '../db/migrationRunner.js';
import { validateEnvironment } from '../utils/envValidation.js';
import { logger } from '../utils/logger.js';

const deployLogger = logger.child('DEPLOY');

async function deploy() {
    try {
        console.log('🚀 Starting deployment process...\n');

        // Step 1: Validate environment
        console.log('1️⃣ Validating environment variables...');
        try {
            validateEnvironment();
            console.log('✅ Environment validation passed');
        } catch (error) {
            console.error('❌ Environment validation failed:', error.message);
            process.exit(1);
        }

        // Step 2: Test database connection
        console.log('\n2️⃣ Testing database connection...');
        const migrationRunner = new MigrationRunner();
        try {
            await migrationRunner.initialize();
            console.log('✅ Database connection successful');
        } catch (error) {
            console.error('❌ Database connection failed:', error.message);
            process.exit(1);
        }

        // Step 3: Run migrations
        console.log('\n3️⃣ Running database migrations...');
        try {
            const result = await migrationRunner.runMigrations();
            if (result.executed > 0) {
                console.log(`✅ Migrations completed: ${result.executed} migrations executed`);
            } else {
                console.log('✅ Database is up to date');
            }
        } catch (error) {
            console.error('❌ Migration failed:', error.message);
            process.exit(1);
        }

        // Step 4: Verify deployment readiness
        console.log('\n4️⃣ Verifying deployment readiness...');
        try {
            const status = await migrationRunner.checkStatus();
            if (status.pending > 0) {
                console.error(`❌ ${status.pending} migrations still pending`);
                process.exit(1);
            }
            console.log('✅ All migrations completed successfully');
        } catch (error) {
            console.error('❌ Deployment verification failed:', error.message);
            process.exit(1);
        }

        console.log('\n🎉 Deployment ready!');
        console.log('📊 Migration Status:');
        console.log(`   Total migrations: ${status.total}`);
        console.log(`   Executed: ${status.executed}`);
        console.log(`   Pending: ${status.pending}`);

        console.log('\n🚀 You can now start the server with:');
        console.log('   npm start');

    } catch (error) {
        deployLogger.error('Deployment failed', { error: error.message });
        console.error('❌ Deployment failed:', error.message);
        process.exit(1);
    }
}

deploy();
