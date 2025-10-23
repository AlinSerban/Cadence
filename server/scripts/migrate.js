#!/usr/bin/env node

/**
 * Migration CLI Script
 * Usage: node scripts/migrate.js [command]
 * Commands: run, status, check
 */

import { MigrationRunner } from '../db/migrationRunner.js';
import { logger } from '../utils/logger.js';

const command = process.argv[2] || 'run';

async function main() {
    const migrationRunner = new MigrationRunner();

    try {
        switch (command) {
            case 'run':
                console.log('🚀 Running database migrations...\n');
                const result = await migrationRunner.runMigrations();
                console.log(`✅ Migrations completed: ${result.executed}/${result.total} executed`);
                break;

            case 'status':
                console.log('📊 Checking migration status...\n');
                const status = await migrationRunner.checkStatus();
                console.log(`📈 Migration Status:`);
                console.log(`   Total migrations: ${status.total}`);
                console.log(`   Executed: ${status.executed}`);
                console.log(`   Pending: ${status.pending}`);
                console.log('\n📋 Migration Details:');
                status.migrations.forEach(migration => {
                    const statusIcon = migration.executed ? '✅' : '⏳';
                    console.log(`   ${statusIcon} ${migration.filename} (${migration.status})`);
                });
                break;

            case 'check':
                console.log('🔍 Checking database connection...\n');
                await migrationRunner.initialize();
                console.log('✅ Database connection successful');
                break;

            default:
                console.log('❌ Unknown command:', command);
                console.log('\n📖 Available commands:');
                console.log('   run    - Execute pending migrations');
                console.log('   status - Show migration status');
                console.log('   check  - Test database connection');
                process.exit(1);
        }
    } catch (error) {
        console.error('❌ Migration command failed:', error.message);
        process.exit(1);
    }
}

main();
