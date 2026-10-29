import { apiClient } from "./apiClient.js";

/**
 * Lấy thông tin hồ sơ người dùng hiện tại
 */
export async function getUserProfile() {
  const response = await apiClient("/api/user/profile");
  return response.data?.user || response.data;
}

/**
 * Lấy danh sách toàn bộ người dùng (Dành cho ADMIN / MASTER_ADMIN)
 */
export async function getAllUsers() {
  const response = await apiClient("/api/admin/users");
  return response.data;
}

/**
 * Khóa hoặc Mở khóa tài khoản (Dành cho ADMIN / MASTER_ADMIN)
 */
export async function toggleUserStatus(userId) {
  const response = await apiClient(`/api/admin/users/${userId}/status`, {
    method: "PATCH",
  });
  return response.data;
}

/**
 * Cập nhật vai trò người dùng (Dành riêng cho MASTER_ADMIN)
 */
export async function updateUserRole(userId, newRole) {
  const response = await apiClient(`/api/admin/master/users/${userId}/role`, {
    method: "PATCH",
    body: JSON.stringify({ role: newRole }),
  });
  return response.data;
}

