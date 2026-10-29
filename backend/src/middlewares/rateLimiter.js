import { ApiError } from "../utils/ApiError.js";

const requestCounts = new Map();

/**
 * Middleware giới hạn tần suất gọi API (Rate Limiter)
 * @param {number} maxRequests Số request tối đa trong cửa sổ thời gian
 * @param {number} windowMs Thời gian cửa sổ tính bằng milliseconds
 */
export function rateLimiter(maxRequests = 100, windowMs = 60 * 1000) {
  return (req, res, next) => {
    const ip = req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress || "global";
    const now = Date.now();

    const clientRecord = requestCounts.get(ip) || { count: 0, resetTime: now + windowMs };

    if (now > clientRecord.resetTime) {
      clientRecord.count = 1;
      clientRecord.resetTime = now + windowMs;
    } else {
      clientRecord.count += 1;
    }

    requestCounts.set(ip, clientRecord);

    if (clientRecord.count > maxRequests) {
      return next(
        new ApiError(429, "Quá nhiều yêu cầu từ địa chỉ IP này. Vui lòng thử lại sau.")
      );
    }

    next();
  };
}

export default rateLimiter;

