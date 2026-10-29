/**
 * Định nghĩa tất cả các tuyến đường (routes) trong ứng dụng Frontend
 */
export const ROUTES = {
  // Public routes
  LOGIN: "/login",
  SSO_CALLBACK: "/sso/callback",
  FORBIDDEN: "/forbidden",
  NOT_FOUND: "/404",

  // Protected routes theo vai trò
  ROOT: "/",
  DASHBOARD: "/dashboard",
  USERS: "/user",
  ADMIN: "/admin",
  MASTER_ADMIN: "/master-admin",
};

/**
 * Trả về route mặc định dựa theo vai trò của người dùng
 */
export function getDefaultRouteForRole(role) {
  switch (role) {
    case "MASTER_ADMIN":
      return ROUTES.MASTER_ADMIN;
    case "ADMIN":
      return ROUTES.ADMIN;
    case "USER":
    default:
      return ROUTES.USERS;
  }
}
