import Redis from "ioredis";

// In-Memory Map lưu thông tin chi tiết token bị ban (Fallback an toàn)
const inMemoryBlacklist = new Map();
let redisClient = null;
let isRedisConnected = false;

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

try {
  redisClient = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 1,
    retryStrategy(times) {
      if (times > 3) return null; // Không retry vô tận nếu Redis server không mở
      return 2000;
    },
    lazyConnect: true,
  });

  redisClient.connect().then(() => {
    isRedisConnected = true;
    console.log("Redis connected successfully at", REDIS_URL);
  }).catch(() => {
    isRedisConnected = false;
  });

  redisClient.on("connect", () => { isRedisConnected = true; });
  redisClient.on("error", () => { isRedisConnected = false; });
  redisClient.on("close", () => { isRedisConnected = false; });
} catch {
  isRedisConnected = false;
}

/**
 * Đưa Token hoặc JTI vào danh sách đen (Blacklist) với thời gian hết hạn (TTL) và thông tin audit
 */
export async function blacklistToken(tokenKey, ttlSeconds = 900, metadata = {}) {
  if (!tokenKey) return;
  const safeTtl = Math.max(1, Math.floor(ttlSeconds));

  const entry = {
    key: tokenKey,
    bannedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + safeTtl * 1000).toISOString(),
    ttl: safeTtl,
    email: metadata.email || "N/A",
    role: metadata.role || "N/A",
  };

  // 1. Lưu vào bộ nhớ đệm
  inMemoryBlacklist.set(tokenKey, entry);
  setTimeout(() => {
    inMemoryBlacklist.delete(tokenKey);
  }, safeTtl * 1000).unref?.();

  // 2. Lưu vào Redis nếu có kết nối
  if (isRedisConnected && redisClient) {
    try {
      await redisClient.setex(`blacklist:${tokenKey}`, safeTtl, JSON.stringify(entry));
    } catch (err) {
      console.warn("Lỗi ghi Redis blacklist:", err.message);
    }
  }

  return entry;
}

/**
 * Kiểm tra xem Token hoặc JTI có bị blacklist trong Redis hay không
 */
export async function isTokenBlacklisted(tokenKey) {
  if (!tokenKey) return false;

  if (inMemoryBlacklist.has(tokenKey)) {
    return true;
  }

  if (isRedisConnected && redisClient) {
    try {
      const exists = await redisClient.exists(`blacklist:${tokenKey}`);
      return exists === 1;
    } catch (err) {
      return inMemoryBlacklist.has(tokenKey);
    }
  }

  return false;
}

/**
 * Lấy danh sách token đang bị blacklist (phục vụ hiển thị trên Master Admin Panel)
 */
export async function getBlacklistedTokens() {
  const list = [];
  const now = Date.now();

  for (const [key, val] of inMemoryBlacklist.entries()) {
    const remainingSeconds = Math.max(0, Math.floor((new Date(val.expiresAt).getTime() - now) / 1000));
    list.push({ ...val, remainingSeconds });
  }

  if (isRedisConnected && redisClient) {
    try {
      const keys = await redisClient.keys("blacklist:*");
      for (const k of keys) {
        const data = await redisClient.get(k);
        if (data) {
          try {
            const parsed = JSON.parse(data);
            if (!list.some((item) => item.key === parsed.key)) {
              const remainingSeconds = Math.max(0, Math.floor((new Date(parsed.expiresAt).getTime() - now) / 1000));
              list.push({ ...parsed, remainingSeconds });
            }
          } catch {
            const cleanKey = k.replace("blacklist:", "");
            if (!list.some((item) => item.key === cleanKey)) {
              list.push({ key: cleanKey, bannedAt: new Date().toISOString(), remainingSeconds: 900 });
            }
          }
        }
      }
    } catch (err) {
      console.warn("Lỗi lấy danh sách Redis blacklist:", err.message);
    }
  }

  return list;
}

export function getRedisStatus() {
  return {
    connected: isRedisConnected,
    mode: isRedisConnected ? "REDIS_SERVER" : "IN_MEMORY_FALLBACK",
    redisUrl: REDIS_URL,
    totalBlacklisted: inMemoryBlacklist.size,
  };
}

export default {
  blacklistToken,
  isTokenBlacklisted,
  getBlacklistedTokens,
  getRedisStatus,
};
