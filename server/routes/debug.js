import { Router } from "express";
import { redisPing } from "../lib/redis.js";

const r = Router();

r.get("/_debug/redis", async (_req, res) => {
  try {
    const pong = await redisPing();
    res.json({ ok: true, pong, env: process.env.APP_ENV ?? "dev" });
  } catch (err) {
    res.status(500).json({ ok: false, error: err?.message ?? String(err) });
  }
});

export default r;
