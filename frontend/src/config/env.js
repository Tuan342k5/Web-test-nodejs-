/**
 * Cấu hình biến môi trường Frontend
 * Hỗ trợ cả môi trường trình duyệt (Vite import.meta.env) và môi trường kiểm thử (Node.js)
 */
export const API_BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  (typeof process !== "undefined" && process.env?.VITE_API_URL) ||
  "http://localhost:3000";

export const APP_CONFIG = {
  apiBaseUrl: API_BASE_URL,
  tokenStorageKey: "accessToken",
  appName: "Auth RBAC Enterprise",
};
