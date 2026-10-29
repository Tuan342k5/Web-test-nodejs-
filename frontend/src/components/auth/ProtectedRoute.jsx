import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import Loading from "../common/Loading.jsx";
import { ROUTES } from "../../constants/routes.js";

/**
 * Route bảo vệ yêu cầu đăng nhập và phân quyền vai trò
 */
export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loading message="Đang kiểm tra phiên làm việc..." />;
  }

  // Chưa đăng nhập -> Chuyển về trang đăng nhập
  if (!isAuthenticated || !user) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  // Kiểm tra phân quyền vai trò
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to={ROUTES.FORBIDDEN} replace />;
  }

  return children;
}

