import { getRedisClient, isRedisReady, getRedisConfig } from "../config/redis.js";

// In-Memory Fallback nếu không có Redis Server
const inMemoryBlacklist = new Map();

/**
 * Đưa Token hoặc JTI vào danh sách đen (Blacklist) với thời gian hết hạn (TTL)
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
    type: metadata.type || "jti",
  };

  // 1. Lưu vào in-memory fallback
  inMemoryBlacklist.set(tokenKey, entry);
  setTimeout(() => {
    inMemoryBlacklist.delete(tokenKey);
  }, safeTtl * 1000).unref?.();

  // 2. Lưu vào Redis nếu kết nối
  if (isRedisReady()) {
    try {
      const redis = getRedisClient();
      await redis.setex(`blacklist:${tokenKey}`, safeTtl, JSON.stringify(entry));
    } catch (err) {
      console.warn("[Redis] Lỗi ghi blacklist:", err.message);
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

  if (isRedisReady()) {
    try {
      const redis = getRedisClient();
      const exists = await redis.exists(`blacklist:${tokenKey}`);
      return exists === 1;
    } catch (err) {
      return inMemoryBlacklist.has(tokenKey);
    }
  }

  return false;
}

/**
 * Lấy danh sách token đang bị ban trong Redis
 */
export async function getBlacklistedTokens() {
  const list = [];
  const now = Date.now();

  for (const [key, val] of inMemoryBlacklist.entries()) {
    const remainingSeconds = Math.max(0, Math.floor((new Date(val.expiresAt).getTime() - now) / 1000));
    list.push({ ...val, remainingSeconds });
  }

  if (isRedisReady()) {
    try {
      const redis = getRedisClient();
      const keys = await redis.keys("blacklist:*");
      for (const k of keys) {
        const data = await redis.get(k);
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
      console.warn("[Redis] Lỗi lấy danh sách blacklist:", err.message);
    }
  }

  return list;
}

export function getBlacklistStatus() {
  const config = getRedisConfig();
  return {
    ...config,
    totalBlacklisted: inMemoryBlacklist.size,
  };
}

