import { ROLES, ALL_ROLES } from "../constants/roles.js";

const rolesMetadata = [
  {
    role: ROLES.MASTER_ADMIN,
    name: "Tổng Quản Trị Hệ Thống",
    description: "Toàn quyền tối cao, quản lý phân quyền, cấu hình và giám sát Redis Blacklist",
    level: 3,
  },
  {
    role: ROLES.ADMIN,
    name: "Quản Trị Viên",
    description: "Quản trị người dùng, khóa/mở khóa tài khoản người dùng trong hệ thống",
    level: 2,
  },
  {
    role: ROLES.USER,
    name: "Người Dùng Tiêu Chuẩn",
    description: "Người dùng cơ bản, xem và quản lý thông tin tài khoản cá nhân",
    level: 1,
  },
];

export async function getAllRoles() {
  return rolesMetadata;
}

export async function isValidRole(role) {
  return ALL_ROLES.includes(role);
}

export async function getRoleDetails(role) {
  return rolesMetadata.find((r) => r.role === role) || null;
}

