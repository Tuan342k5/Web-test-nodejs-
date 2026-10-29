import "./env.js";
import Redis from "ioredis";

export const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

let redisClient = null;
let isConnected = false;

try {
  redisClient = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 1,
    retryStrategy(times) {
      if (times > 3) return null;
      return 2000;
    },
    lazyConnect: true,
  });

  redisClient
    .connect()
    .then(() => {
      isConnected = true;
      console.log("Redis client connected successfully at", REDIS_URL);
    })
    .catch(() => {
      isConnected = false;
    });

  redisClient.on("connect", () => {
    isConnected = true;
  });

  redisClient.on("error", () => {
    isConnected = false;
  });

  redisClient.on("close", () => {
    isConnected = false;
  });
} catch {
  isConnected = false;
}

export function getRedisClient() {
  return redisClient;
}

export function isRedisReady() {
  return isConnected && redisClient;
}

export function getRedisConfig() {
  return {
    connected: isConnected,
    mode: isConnected ? "REDIS_SERVER" : "IN_MEMORY_FALLBACK",
    redisUrl: REDIS_URL,
  };
}

