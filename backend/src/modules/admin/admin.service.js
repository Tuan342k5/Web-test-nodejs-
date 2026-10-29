import { getBlacklistedTokens, getBlacklistStatus } from "../../security/tokenBlacklist.service.js";

export async function getSystemStatus() {
  return {
    system: {
      nodeVersion: process.version,
      uptimeSeconds: Math.floor(process.uptime()),
      memoryUsageMb: Math.round(process.memoryUsage().rss / (1024 * 1024)),
      platform: process.platform,
    },
    redis: getBlacklistStatus(),
  };
}

export async function getBlacklistData() {
  const tokens = await getBlacklistedTokens();
  const redisInfo = getBlacklistStatus();
  return {
    redisStatus: redisInfo,
    blacklistedTokens: tokens,
  };
}

