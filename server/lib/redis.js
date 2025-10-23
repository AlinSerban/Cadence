import Redis from "ioredis";
const APP_ENV = process.env.APP_ENV ?? "dev";
const REDIS_URL = process.env.REDIS_URL ?? "redis://127.0.0.1:6379";
const REDIS_DB = Number(process.env.REDIS_DB ?? "0");

// Optional: set REDIS_TLS=true if you need TLS even with a redis:// URL.
// For ElastiCache with encryption, prefer using a rediss:// endpoint.
const FORCE_TLS = process.env.REDIS_TLS === "true";

if (!globalThis.__dif_redis__) {
  const opts = {
    db: REDIS_DB,
    connectTimeout: 10_000,
    lazyConnect: false,
    enableAutoPipelining: true,
  };

  if (FORCE_TLS && !REDIS_URL.startsWith("rediss://")) {
    // ioredis accepts tls in options; most setups don't need this if using rediss://
    opts.tls = {};
  }

  const client = new Redis(REDIS_URL, opts);

  client.on("error", (err) => {
    console.error("[redis] error:", err?.message ?? err);
  });

  client.on("connect", () => console.log("[redis] connecting..."));
  client.on("ready", () => console.log("[redis] ready"));
  client.on("reconnecting", () => console.log("[redis] reconnecting..."));

  globalThis.__dif_redis__ = client;
}

export const redis = globalThis.__dif_redis__;

export async function redisPing() {
  return redis.ping();
}

export function redisKey(...parts) {
  return ["dif", APP_ENV, ...parts.filter(Boolean)].join(":");
}

export function ttlWithJitter(baseSeconds, jitter = 0.2) {
  const delta = Math.floor(baseSeconds * jitter);
  const offset = Math.floor(Math.random() * (2 * delta + 1)) - delta;
  const ttl = baseSeconds + offset;
  return Math.max(1, ttl);
}
