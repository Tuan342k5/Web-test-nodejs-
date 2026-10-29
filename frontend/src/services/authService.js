import { apiClient } from "./apiClient.js";

/**
 * Đăng nhập bằng Email & Mật khẩu
 */
export async function login(email, password) {
  const response = await apiClient("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  return response.data;
}

/**
 * Đăng nhập Google SSO
 */
export async function loginWithSSO(payload) {
  const response = await apiClient("/api/auth/sso/google", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return response.data;
}

/**
 * Đăng xuất và thu hồi Token vào Redis Blacklist
 */
export async function logout() {
  try {
    return await apiClient("/api/auth/logout", {
      method: "POST",
    });
  } catch (error) {
    console.warn("[AuthService] Lỗi khi gọi logout API:", error.message);
    return null;
  }
}

/**
 * Lấy thông tin tài khoản hiện tại từ Access Token
 */
export async function getCurrentUser() {
  const response = await apiClient("/api/auth/me");
  return response.data?.user || response.data;
}

/**
 * Kiểm tra trạng thái Redis Blacklist
 */
export async function getRedisStatus() {
  return apiClient("/api/auth/redis-status");
}

