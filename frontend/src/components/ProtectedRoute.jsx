import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { Box, CircularProgress } from "@mui/material";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  // Chưa đăng nhập -> Chuyển về /login
  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  // Kiểm tra phân quyền RBAC
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Điều hướng về đúng trang tương ứng với role của tài khoản
    if (user.role === "MASTER_ADMIN") return <Navigate to="/master-admin" replace />;
    if (user.role === "ADMIN") return <Navigate to="/admin" replace />;
    return <Navigate to="/user" replace />;
  }

  return children;
}

