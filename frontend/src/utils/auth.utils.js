import { APP_CONFIG } from "../config/env.js";
import { ROUTES, getDefaultRouteForRole } from "../constants/routes.js";

/**
 * Lấy Access Token từ localStorage
 */
export function getStoredToken() {
  return localStorage.getItem(APP_CONFIG.tokenStorageKey) || "";
}

/**
 * Lưu Access Token vào localStorage
 */
export function setStoredToken(token) {
  if (token) {
    localStorage.setItem(APP_CONFIG.tokenStorageKey, token);
  } else {
    removeStoredToken();
  }
}

/**
 * Xóa Access Token khỏi localStorage
 */
export function removeStoredToken() {
  localStorage.removeItem(APP_CONFIG.tokenStorageKey);
}

/**
 * Giải mã JWT Payload mà không cần thư viện bên ngoài
 */
export function parseJwtPayload(token) {
  if (!token || typeof token !== "string") return null;
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/**
 * Kiểm tra xem token đã hết hạn hay chưa
 */
export function isTokenExpired(token) {
  const payload = parseJwtPayload(token);
  if (!payload || !payload.exp) return true;
  const now = Math.floor(Date.now() / 1000);
  return payload.exp <= now;
}

export { getDefaultRouteForRole, ROUTES };

