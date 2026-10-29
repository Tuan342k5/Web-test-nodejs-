import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

// Pages
import LoginPage from "./pages/LoginPage.jsx";
import UserPage from "./pages/UserPage.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import MasterAdminPage from "./pages/MasterAdminPage.jsx";

// Component điều hướng thông minh cho route gốc "/"
function RootRedirect() {
  const { user, token, loading } = useAuth();

  if (loading) return null;

  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === "MASTER_ADMIN") return <Navigate to="/master-admin" replace />;
  if (user.role === "ADMIN") return <Navigate to="/admin" replace />;
  return <Navigate to="/user" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Route Đăng nhập */}
          <Route path="/login" element={<LoginPage />} />

          {/* Route dành riêng cho USER */}
          <Route
            path="/user"
            element={
              <ProtectedRoute allowedRoles={["USER"]}>
                <UserPage />
              </ProtectedRoute>
            }
          />

          {/* Route dành riêng cho ADMIN */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminPage />
              </ProtectedRoute>
            }
          />

          {/* Route dành riêng cho MASTER_ADMIN */}
          <Route
            path="/master-admin"
            element={
              <ProtectedRoute allowedRoles={["MASTER_ADMIN"]}>
                <MasterAdminPage />
              </ProtectedRoute>
            }
          />

          {/* Mặc định chuyển hướng theo trạng thái đăng nhập */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
