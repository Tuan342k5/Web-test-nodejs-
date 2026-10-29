import { ApiError } from "../utils/ApiError.js";

/**
 * Middleware phân quyền Role-Based Access Control (RBAC)
 * @param  {...string} allowedRoles Danh sách vai trò được phép (ví dụ: 'MASTER_ADMIN', 'ADMIN')
 */
export function authorize(...allowedRoles) {
  const roles = allowedRoles.flat();

  return (req, res, next) => {
    const userRole = req.auth?.role || req.user?.role;

    if (!userRole) {
      return next(new ApiError(401, "Yêu cầu đăng nhập trước khi truy cập tài nguyên này."));
    }

    if (!roles.includes(userRole)) {
      return next(
        new ApiError(
          403,
          `Bạn không có quyền truy cập tài nguyên này. Yêu cầu quyền: ${roles.join(", ")}.`
        )
      );
    }

    next();
  };
}

export const authorizeRoles = authorize;
export default authorize;

