import { verifyAccessToken } from "../services/token.service.js";
import { isTokenBlacklisted } from "../services/redis.service.js";

/**
 * Middleware xác thực Access Token từ Header Authorization: Bearer <token>
 * Kiểm tra tính hợp lệ của token và kiểm tra Redis blacklist (đã logout chưa).
 */
export async function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Không tìm thấy Access Token hoặc định dạng Authorization header không hợp lệ (cần 'Bearer <token>').",
    });
  }

  const token = authHeader.slice(7).trim();

  try {
    const decoded = verifyAccessToken(token);

    // Kiểm tra Redis Blacklist (nếu user đã bấm logout thì token bị ban)
    const isBanned =
      (decoded.jti && (await isTokenBlacklisted(decoded.jti))) ||
      (await isTokenBlacklisted(token));

    if (isBanned) {
      return res.status(401).json({
        success: false,
        isBanned: true,
        message: "Token đã bị thu hồi do người dùng đã đăng xuất (Banned by Redis). Vui lòng đăng nhập lại.",
      });
    }

    const authData = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
      jti: decoded.jti,
      exp: decoded.exp,
      iat: decoded.iat,
    };

    // Gán vào cả req.auth và req.user để tương thích hoàn toàn
    req.auth = authData;
    req.user = authData;
    req.token = token;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token đã hết hạn. Vui lòng đăng nhập lại.",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Token không hợp lệ hoặc đã bị chỉnh sửa.",
    });
  }
}

/**
 * Middleware phân quyền Role-Based Access Control (RBAC)
 * @param  {...string} allowedRoles Danh sách vai trò được phép (ví dụ: 'MASTER_ADMIN', 'ADMIN')
 */
export function authorizeRoles(...allowedRoles) {
  const roles = allowedRoles.flat();

  return (req, res, next) => {
    const userRole = req.auth?.role || req.user?.role;

    if (!userRole) {
      return res.status(401).json({
        success: false,
        message: "Yêu cầu đăng nhập trước khi truy cập tài nguyên này.",
      });
    }

    if (!roles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Bạn không có quyền truy cập tài nguyên này. Yêu cầu quyền: ${roles.join(", ")}.`,
      });
    }

    next();
  };
}

// Export các alias tương thích
export const authenticate = authenticateToken;
export const authorize = authorizeRoles;

export default {
  authenticateToken,
  authorizeRoles,
  authenticate,
  authorize,
};
