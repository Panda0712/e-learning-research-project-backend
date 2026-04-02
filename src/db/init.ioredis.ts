import { env } from "@/configs/environment.js";
import { Redis } from "ioredis";

let redisClient: Redis | null = null;
let connectionTimeout: NodeJS.Timeout;

const REDIS_CONNECT_TIMEOUT = 10000;

const handleTimeoutError = () => {
  connectionTimeout = setTimeout(() => {
    console.error("Redis connection timeout");
  }, REDIS_CONNECT_TIMEOUT);
};

const handleEventConnection = (client: Redis) => {
  client.on("connect", () => {
    console.log("Redis connected");
    clearTimeout(connectionTimeout);
  });

  client.on("end", () => {
    console.log("Redis disconnected");
    handleTimeoutError();
  });

  client.on("reconnecting", () => {
    console.log("Redis reconnecting");
    clearTimeout(connectionTimeout);
  });

  client.on("error", (err: Error) => {
    console.error("Redis error:", err.message);
    handleTimeoutError();
  });
};

const initIoRedis = async ({
  IOREDIS_IS_ENABLED,
  IOREDIS_HOST = env.REDIS_CACHE_HOST || "localhost",
  IOREDIS_PORT = 6379,
}: {
  IOREDIS_IS_ENABLED: boolean;
  IOREDIS_HOST?: string;
  IOREDIS_PORT?: number;
}) => {
  if (!IOREDIS_IS_ENABLED) return;

  try {
    redisClient = new Redis({
      host: IOREDIS_HOST,
      port: IOREDIS_PORT,
      retryStrategy: (times) => Math.min(times * 50, 2000),
    });

    handleEventConnection(redisClient);

    console.log("Redis initialized");
  } catch (error) {
    console.error("Redis init failed:", error);
  }
};

const getIoRedis = () => redisClient;

const closeIoRedis = async () => {
  if (!redisClient) return;

  try {
    await redisClient.quit();
    console.log("Redis closed");
  } catch (error) {
    console.error("Error closing Redis:", error);
  }
};

export const RedisDB = {
  initIoRedis,
  getIoRedis,
  closeIoRedis,
};
