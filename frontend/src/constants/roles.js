/**
 * Hằng số vai trò người dùng trong hệ thống RBAC
 */
export const ROLES = {
  MASTER_ADMIN: "MASTER_ADMIN",
  ADMIN: "ADMIN",
  USER: "USER",
};

export const ALL_ROLES = [ROLES.MASTER_ADMIN, ROLES.ADMIN, ROLES.USER];

export const ROLE_LABELS = {
  [ROLES.MASTER_ADMIN]: "Tổng Quản Trị (Master Admin)",
  [ROLES.ADMIN]: "Quản Trị Viên (Admin)",
  [ROLES.USER]: "Người Dùng (User)",
};

