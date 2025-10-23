import { redis, redisKey, ttlWithJitter } from "./redis.js";

export async function getUserVersion(userId, field) {
  const verKey = redisKey(userId, "ver"); // dif:{env}:{userId}:ver
  const v = await redis.hget(verKey, field);
  return Number(v || 0);
}

export async function bumpUserVersion(userId, field, delta = 1) {
  const verKey = redisKey(userId, "ver");
  await redis.hincrby(verKey, field, delta);
}

export async function readThroughJSON({
  userId,
  domain,
  scope,
  versionField,
  ttlBaseSeconds,
  computeFn,
}) {
  const ver = await getUserVersion(userId, versionField);
  const key = redisKey(userId, domain, scope, `v${ver}`);

  const cached = await redis.get(key);
  if (cached) {
    console.log("[cache HIT]", key);
    return JSON.parse(cached);
  }
  console.log("[cache MISS]", key);

  const data = await computeFn();
  const ttl = ttlWithJitter(ttlBaseSeconds, 0.2);
  await redis.set(key, JSON.stringify(data), "EX", ttl);
  return data;
}
