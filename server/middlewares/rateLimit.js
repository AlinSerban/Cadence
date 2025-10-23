import crypto from "crypto";
import { redis, redisKey } from "../lib/redis.js";

const WINDOW_SEC = 5 * 60;
const LIMIT_PER_IP = 50;
const LIMIT_PER_ACCOUNT = 10;
// Refresh limiter (env-overridable)
const REFRESH_WINDOW_SEC = Number(process.env.REFRESH_WINDOW_SEC || 60); // 60s window
const REFRESH_LIMIT_PER_IP = Number(process.env.REFRESH_LIMIT_PER_IP || 60); // max 60 refreshes/IP/min
const REFRESH_LIMIT_PER_TOKEN = Number(
  process.env.REFRESH_LIMIT_PER_TOKEN || 20
); // max 20 refreshes/refreshToken/min

export function hmacId(s) {
  const secret = process.env.RATE_LIMIT_SECRET || "devsalt";
  return crypto
    .createHmac("sha256", secret)
    .update(String(s).toLowerCase())
    .digest("hex")
    .slice(0, 32);
}

async function hitWindow(key, limit, windowSec) {
  const n = await redis.incr(key);
  if (n === 1) await redis.expire(key, windowSec);
  const ttl = await redis.ttl(key);
  const allowed = n <= limit;
  return {
    allowed,
    count: n,
    remaining: Math.max(0, limit - n),
    retryAfter: allowed ? 0 : Math.max(1, ttl),
  };
}

export async function rateLimitLogin(req, res, next) {
  try {
    const ip =
      (
        req.headers["x-forwarded-for"]?.split(",")[0] ||
        req.ip ||
        req.socket?.remoteAddress ||
        ""
      ).trim() || "unknown";
    const email = req.body?.email ? hmacId(req.body.email) : null;

    const ipKey = redisKey("rl", "login", ip);
    const checks = [await hitWindow(ipKey, LIMIT_PER_IP, WINDOW_SEC)];

    if (email) {
      const acctKey = redisKey("rl", "login", email);
      checks.push(await hitWindow(acctKey, LIMIT_PER_ACCOUNT, WINDOW_SEC));
    }

    const blocked = checks.find((c) => !c.allowed);
    if (blocked) {
      res.set("Retry-After", String(blocked.retryAfter));
      return res.status(429).json({
        error: "Too many login attempts. Please try again later.",
        retryAfter: blocked.retryAfter,
      });
    }
    next();
  } catch (err) {
    console.error("[rateLimitLogin] error:", err);
    next();
  }
}

export async function rateLimitRefresh(req, res, next) {
  try {
    const ip =
      (
        req.headers["x-forwarded-for"]?.split(",")[0] ||
        req.ip ||
        req.socket?.remoteAddress ||
        ""
      ).trim() || "unknown";

    const token = req.cookies?.refreshToken || "";
    // hash the token so we never store it raw in Redis
    const tokHash = hmacId(token || "no-token");

    const [ipHit, tokHit] = await Promise.all([
      hitWindow(
        redisKey("rl", "refresh", "ip", ip),
        REFRESH_LIMIT_PER_IP,
        REFRESH_WINDOW_SEC
      ),
      token
        ? hitWindow(
            redisKey("rl", "refresh", "tok", tokHash),
            REFRESH_LIMIT_PER_TOKEN,
            REFRESH_WINDOW_SEC
          )
        : Promise.resolve({
            allowed: true,
            remaining: Infinity,
            retryAfter: 0,
          }),
    ]);

    const blocked = [ipHit, tokHit].find((c) => !c.allowed);
    if (blocked) {
      res.set("Retry-After", String(blocked.retryAfter));
      return res.status(429).json({
        error: "Too many refresh attempts.",
        retryAfter: blocked.retryAfter,
      });
    }
    next();
  } catch (err) {
    console.error("[rateLimitRefresh] error:", err);
    next();
  }
}
