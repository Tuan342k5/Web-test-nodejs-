import React from "react";
import { useAuth } from "../../hooks/useAuth.js";

/**
 * Component kiểm soát hiển thị nội dung theo vai trò
 * @param {Array<string>} roles Danh sách vai trò được phép
 * @param {React.ReactNode} fallback Nội dung hiển thị khi không đủ quyền
 */
export default function RoleGuard({ roles = [], fallback = null, children }) {
  const { user } = useAuth();

  if (!user) return fallback;

  if (roles.length > 0 && !roles.includes(user.role)) {
    return fallback;
  }

  return <>{children}</>;
}

