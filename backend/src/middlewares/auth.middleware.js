import { verifyAccessToken } from "../services/token.service.js";

/**
 * Middleware xác thực Access Token từ Header Authorization: Bearer <token>
 */
export function authenticate(req, res, next) {
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

    // Gán thông tin user từ token vào req.user
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
    };

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
      message: "Token không hợp lệ hoặc đã bị thay đổi.",
    });
  }
}

/**
 * Middleware kiểm tra quyền truy cập (RBAC) theo role
 * @param  {...string} allowedRoles Các role được phép truy cập (ví dụ: 'ADMIN', 'MASTER_ADMIN')
 */
export function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Yêu cầu đăng nhập trước khi truy cập.",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền truy cập tài nguyên này.",
      });
    }

    next();
  };
}

