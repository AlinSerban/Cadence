import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

// Validate environment variables before starting the server
import { validateEnvironment } from "./utils/envValidation.js";
import { MigrationRunner } from "./db/migrationRunner.js";
import { winstonLogger } from "./utils/winstonLogger.js";

try {
  validateEnvironment();
} catch (error) {
  console.error("❌ Environment validation failed:", error.message);
  console.log("\n📝 Please create a .env file based on server/env.example");
  console.log("   Copy server/env.example to server/.env and fill in your values");
  process.exit(1);
}

// Run database migrations before starting the server
async function runMigrations() {
  const migrationLogger = winstonLogger.child('MIGRATION');

  try {
    migrationLogger.startup('Checking database migrations');
    console.log("🗄️  Checking database migrations...");

    const migrationRunner = new MigrationRunner();
    const result = await migrationRunner.runMigrations();

    if (result.executed > 0) {
      migrationLogger.startup(`Migrations completed: ${result.executed} migrations executed`);
      console.log(`✅ Migrations completed: ${result.executed} migrations executed`);
    } else {
      migrationLogger.startup('Database is up to date');
      console.log("✅ Database is up to date");
    }
  } catch (error) {
    migrationLogger.error('Migration failed', { error: error.message, stack: error.stack });
    console.error("❌ Migration failed:", error.message);
    console.log("\n💡 Try running migrations manually:");
    console.log("   node server/scripts/migrate.js run");
    process.exit(1);
  }
}

import express from "express";
//import expressApp from "./express-app.js";
const { default: expressApp } = await import("./express-app.js");
const PORT = 3000;

const StartServer = async () => {
  const serverLogger = winstonLogger.child('SERVER');

  try {
    // Run migrations first
    await runMigrations();

    const app = express();

    await expressApp(app);

    app
      .listen(PORT, () => {
        serverLogger.startup('Server started successfully', {
          port: PORT,
          environment: process.env.NODE_ENV || 'development',
          corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173'
        });
        console.log(`🚀 Server started on port: ${PORT}`);
        console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`🔗 CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
      })
      .on("error", (err) => {
        serverLogger.error('Server startup error', { error: err.message, stack: err.stack });
        console.error("❌ Server error:", err);
      });
  } catch (error) {
    serverLogger.error('Server startup failed', { error: error.message, stack: error.stack });
    console.error("❌ Server startup failed:", error);
    process.exit(1);
  }
};

StartServer();
