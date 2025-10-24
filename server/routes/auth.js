import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../db/db.js";
import { registerSchema, loginSchema } from "../validation/authValidation.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { v4 as uuidv4 } from "uuid";
import cookieParser from "cookie-parser";
import { rateLimitLogin, rateLimitRefresh } from "../middlewares/rateLimit.js";
import { hmacId } from "../middlewares/rateLimit.js";
import { readThroughJSON, bumpUserVersion } from "../lib/cache.js";
import { redis, redisKey } from "../lib/redis.js";
import { logger } from "../utils/logger.js";
const router = express.Router();
router.use(cookieParser());
const COOKIE_SECURE = process.env.COOKIE_SECURE === "true";

router.post("/register", async (req, res) => {
  const authLogger = logger.child('AUTH');

  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      authLogger.warn('Registration validation failed', { error: error.details[0].message });
      return res.status(400).json({ error: error.details[0].message });
    }

    const { fullName, email, username, password } = value;
    authLogger.info('Registration attempt', { email, username });

    const hashsedPassword = await bcrypt.hash(password, 10);

    // Check for existing email
    const existingEmail = await pool.query(
      "SELECT id FROM users WHERE email=$1",
      [email]
    );
    if (existingEmail.rowCount) {
      authLogger.warn('Registration failed - email already exists', { email });
      return res.status(400).json({ error: "An account with this email already exists" });
    }

    // Check for existing username
    const existingUsername = await pool.query(
      "SELECT id FROM users WHERE username=$1",
      [username]
    );
    if (existingUsername.rowCount) {
      authLogger.warn('Registration failed - username already exists', { username });
      return res.status(400).json({ error: "This username is already taken" });
    }

    const result = await pool.query(
      "INSERT INTO users (full_name, email, username, password) VALUES ($1, $2, $3, $4) RETURNING id, full_name, email, username",
      [fullName, email, username, hashsedPassword]
    );

    const user = result.rows[0];
    const { accessToken, refreshToken, jti } = generateTokens(user.id);

    // Calculate expiration date (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await pool.query(
      "INSERT INTO refresh_tokens(token_id, user_id, expires_at) VALUES($1, $2, $3)",
      [jti, user.id, expiresAt]
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: COOKIE_SECURE,
      sameSite: "None",    // Most permissive for cross-origin
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    authLogger.auth('user_registered', user.id, { email, username });
    res.json({ user, accessToken });
  } catch (err) {
    authLogger.error('Registration failed', { error: err.message, stack: err.stack });
    console.error("Register failed: " + err);

    // Handle database constraint violations
    if (err.code === '23505') { // Unique constraint violation
      if (err.constraint === 'users_email_key') {
        return res.status(400).json({ error: "An account with this email already exists" });
      }
      if (err.constraint === 'users_username_key') {
        return res.status(400).json({ error: "This username is already taken" });
      }
    }

    res.status(500).json({ error: "Server error during registration" });
  }
});

router.post("/login", rateLimitLogin, async (req, res) => {
  const { error, value } = loginSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const { email, password } = value;
  const result = await pool.query("SELECT * FROM users WHERE email=$1", [
    email,
  ]);
  if (!result.rowCount)
    return res.status(400).json({ error: "Invalid credentials" });

  const user = result.rows[0];
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ error: "Invalid credentials" });

  const ip =
    (
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.ip ||
      req.socket?.remoteAddress ||
      ""
    ).trim() || "unknown";
  const acctHash = hmacId(email);
  await Promise.all([
    redis.del(redisKey("rl", "login", "ip", ip)),
    redis.del(redisKey("rl", "login", "acct", acctHash)),
  ]);

  const { accessToken, refreshToken, jti } = generateTokens(user.id);

  // Calculate expiration date (7 days from now)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await pool.query(
    "INSERT INTO refresh_tokens(token_id, user_id, expires_at) VALUES($1, $2, $3)",
    [jti, user.id, expiresAt]
  );

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: "None",    // Most permissive for cross-origin
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  delete user.password;
  res.json({ user, accessToken });
});

router.post("/refresh", rateLimitRefresh, async (req, res) => {
  console.log("🔄 Refresh endpoint called");
  console.log("🍪 Cookies received:", req.cookies);
  console.log("🌐 Origin header:", req.headers.origin);
  console.log("🔗 Referer header:", req.headers.referer);
  
  const token = req.cookies.refreshToken;
  console.log("🔑 Refresh token present:", !!token);
  
  if (!token) {
    console.log("❌ No refresh token found");
    return res.status(401).json({ error: "No refresh token" });
  }

  try {
    console.log("🔍 Verifying refresh token...");
    const payload = jwt.verify(token, process.env.REFRESH_SECRET);
    const { jti, id: userId } = payload;
    console.log("✅ Token verified, user ID:", userId, "JTI:", jti);
    
    const stored = await pool.query(
      "SELECT 1 FROM refresh_tokens WHERE token_id=$1 AND user_id=$2",
      [jti, userId]
    );

    if (!stored.rowCount) {
      console.log("❌ Refresh token not found in database");
      return res.status(403).json({ error: "Refresh token revoked" });
    }
    
    console.log("✅ Refresh token found in database");

    console.log("🗑️ Deleting old refresh token from database");
    await pool.query("DELETE FROM refresh_tokens WHERE token_id=$1", [jti]);

    const {
      accessToken,
      refreshToken: newRefresh,
      jti: newJti,
    } = generateTokens(userId);

    // Calculate expiration date (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    console.log("💾 Inserting new refresh token into database");
    await pool.query(
      "INSERT INTO refresh_tokens(token_id, user_id, expires_at) VALUES($1, $2, $3)",
      [newJti, userId, expiresAt]
    );

    console.log("🍪 Setting new refresh token cookie");
    res.cookie("refreshToken", newRefresh, {
      httpOnly: true,
      secure: COOKIE_SECURE,
      sameSite: "None",    // Most permissive for cross-origin
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    console.log("✅ Refresh successful, sending new access token");
    res.json({ accessToken });
  } catch (err) {
    console.error("Refresh failed:", err);
    return res.status(401).json({ error: "Invalid refresh token" });
  }
});

router.post("/logout", authMiddleware, async (req, res) => {
  await pool.query("DELETE FROM refresh_tokens WHERE user_id=$1", [
    req.user.id,
  ]);

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: "None",    // Most permissive for cross-origin
    path: "/",
  });
  return res.json({ message: "Logged out successfully" });
});

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // Use Redis caching for user profile data
    const data = await readThroughJSON({
      userId,
      domain: "user",
      scope: "profile",
      versionField: "dash",
      ttlBaseSeconds: 300, // 5 minutes cache
      computeFn: async () => {
        const result = await pool.query(
          "SELECT id, full_name, email, username, xp FROM users WHERE id = $1",
          [userId]
        );
        if (!result.rowCount) {
          throw new Error("User not found");
        }
        return result.rows[0];
      }
    });

    res.json(data);
  } catch (error) {
    if (error.message === "User not found") {
      return res.status(401).json({ error: "User not found" });
    }
    console.error("GET /me error:", error);
    res.status(500).json({ error: "Failed to fetch user data" });
  }
});

function generateTokens(userId) {
  const accessToken = jwt.sign({ id: userId }, process.env.TOKEN_SECRET, {
    expiresIn: "15m",
  });
  const jti = uuidv4();
  const refreshToken = jwt.sign(
    { id: userId, jti },
    process.env.REFRESH_SECRET,
    {
      expiresIn: "7d",
    }
  );
  return { accessToken, refreshToken, jti };
}

export default router;
