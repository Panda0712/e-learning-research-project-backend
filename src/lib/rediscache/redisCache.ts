import crypto from "node:crypto";
import { RedisDB } from "@/db/init.ioredis.js";

const PREFIX = "e-learn:v1";
const tagKey = (tag: string) => `${PREFIX}:tag:${tag}`;
const hash = (input: unknown) =>
  crypto
    .createHash("sha1")
    .update(JSON.stringify(input ?? {}))
    .digest("hex");

export const redisCache = {
  key(parts: Array<string | number>, query?: unknown) {
    const base = `${PREFIX}:${parts.join(":")}`;
    return query ? `${base}:${hash(query)}` : base;
  },

  async remember<T>({
    key,
    ttlSeconds,
    tags = [],
    resolver,
  }: {
    key: string;
    ttlSeconds: number;
    tags?: string[];
    resolver: () => Promise<T>;
  }): Promise<T> {
    const redis = RedisDB.getIoRedis();
    if (!redis) return resolver();

    const cached = await redis.get(key);
    if (cached) return JSON.parse(cached) as T;

    const value = await resolver();
    const multi = redis
      .multi()
      .set(key, JSON.stringify(value), "EX", ttlSeconds);

    for (const tag of tags) {
      multi.sadd(tagKey(tag), key);
      multi.expire(tagKey(tag), Math.max(ttlSeconds * 2, 3600));
    }

    await multi.exec();
    return value;
  },

  async invalidateTags(tags: string[]) {
    const redis = RedisDB.getIoRedis();
    if (!redis || tags.length === 0) return;

    const keys = new Set<string>();
    for (const tag of tags) {
      for (const key of await redis.smembers(tagKey(tag))) keys.add(key);
    }

    const multi = redis.multi();
    if (keys.size) multi.del(...Array.from(keys));
    for (const tag of tags) multi.del(tagKey(tag));
    await multi.exec();
  },
};
