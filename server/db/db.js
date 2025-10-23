import { Pool } from "pg";

const cs = process.env.DATABASE_URL;
if (!cs) {
  console.error("[db] Missing DATABASE_URL");
  process.exit(1);
}

let cfg;
try {
  const u = new URL(cs);
  cfg = {
    user: decodeURIComponent(u.username || ""),
    password: String(decodeURIComponent(u.password || "")), // ← force string
    host: u.hostname,
    port: Number(u.port || 5432),
    database: u.pathname.replace(/^\//, ""),
  };

  // Enable SSL for RDS when requested (free-tier safe).
  // Set PGSSLMODE=require in the EC2 .env to turn this on.
  if (process.env.PGSSLMODE === "require") {
    cfg.ssl = { rejectUnauthorized: false };
  }

  console.log("[db] connecting", {
    user: cfg.user,
    host: cfg.host,
    port: cfg.port,
    database: cfg.database,
    hasPassword: typeof cfg.password === "string" && cfg.password.length > 0,
    ssl: !!cfg.ssl,
    pgsslmode: process.env.PGSSLMODE || "disabled",
  });
} catch (e) {
  console.error("[db] Bad DATABASE_URL:", cs);
  throw e;
}

export const pool = new Pool(cfg);

pool.on("error", (err) => {
  console.error("[db] Pool error:", err?.message ?? err);
});
