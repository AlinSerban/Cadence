import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from server directory
dotenv.config({ path: join(__dirname, '..', '.env') });

// Import Pool directly instead of using the db.js module
import { Pool } from 'pg';

async function runMigration() {
    const cs = process.env.DATABASE_URL;
    if (!cs) {
        console.error("[migrate] Missing DATABASE_URL");
        process.exit(1);
    }

    let cfg;
    try {
        const u = new URL(cs);
        cfg = {
            user: decodeURIComponent(u.username || ""),
            password: String(decodeURIComponent(u.password || "")),
            host: u.hostname,
            port: Number(u.port || 5432),
            database: u.pathname.replace(/^\//, ""),
        };

        if (process.env.PGSSLMODE === "require") {
            cfg.ssl = { rejectUnauthorized: false };
        }
    } catch (e) {
        console.error("[migrate] Bad DATABASE_URL:", cs);
        throw e;
    }

    const pool = new Pool(cfg);

    try {
        console.log('Starting database migration...');

        // Read the migration file
        const migrationPath = join(__dirname, 'migrations', '002_activity_board.sql');
        const migrationSQL = readFileSync(migrationPath, 'utf8');

        // Execute the migration
        console.log('Running activity board migration...');
        await pool.query(migrationSQL);

        console.log('✅ Migration completed successfully!');
        console.log('New tables created:');
        console.log('- activity_cards');
        console.log('- activity_columns');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

runMigration();
