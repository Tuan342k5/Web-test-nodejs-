import { API_BASE_URL } from "../config/env.js";
import { getStoredToken, removeStoredToken } from "../utils/auth.utils.js";

/**
 * Client gọi HTTP API tập trung
 */
export async function apiClient(endpoint, options = {}) {
  const token = getStoredToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Nếu token bị 401 (hết hạn hoặc bị Redis blacklist), tự động dọn session
  if (response.status === 401) {
    removeStoredToken();
  }

  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const errorMsg = data?.message || `Lỗi yêu cầu máy chủ (HTTP ${response.status})`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

