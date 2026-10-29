import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { ROUTES, getDefaultRouteForRole } from "../constants/routes.js";
import { ROLES } from "../constants/roles.js";

// Layouts
import PublicLayout from "../layouts/PublicLayout.jsx";
import AuthLayout from "../layouts/AuthLayout.jsx";
import DashboardLayout from "../layouts/DashboardLayout.jsx";

// Components
import ProtectedRoute from "../components/auth/ProtectedRoute.jsx";
import Loading from "../components/common/Loading.jsx";

// Pages
import LoginPage from "../pages/auth/LoginPage.jsx";
import SsoCallbackPage from "../pages/auth/SsoCallbackPage.jsx";
import ForbiddenPage from "../pages/auth/ForbiddenPage.jsx";
import DashboardPage from "../pages/dashboard/DashboardPage.jsx";
import UsersPage from "../pages/users/UsersPage.jsx";
import AdminPage from "../pages/admin/AdminPage.jsx";
import MasterAdminPage from "../pages/master-admin/MasterAdminPage.jsx";
import NotFoundPage from "../pages/NotFoundPage.jsx";

/**
 * Component điều hướng thông minh dựa vào phiên và quyền
 */
function RootRedirect() {
  const { user, token, loading } = useAuth();

  if (loading) return <Loading />;

  if (!user || !token) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <Navigate to={getDefaultRouteForRole(user.role)} replace />;
}

export function AppRouter() {
  return (
    <Routes>
      {/* Route gốc điều hướng tự động */}
      <Route path={ROUTES.ROOT} element={<RootRedirect />} />

      {/* Tuyến xác thực (Auth Layout) */}
      <Route element={<AuthLayout />}>
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.SSO_CALLBACK} element={<SsoCallbackPage />} />
      </Route>

      {/* Tuyến được bảo vệ (Dashboard Layout) */}
      <Route element={<DashboardLayout />}>
        <Route
          path={ROUTES.DASHBOARD}
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Trang USER */}
        <Route
          path={ROUTES.USERS}
          element={
            <ProtectedRoute allowedRoles={[ROLES.USER, ROLES.ADMIN, ROLES.MASTER_ADMIN]}>
              <UsersPage />
            </ProtectedRoute>
          }
        />
        {/* Alias /users cho sự tương thích */}
        <Route
          path="/users"
          element={
            <ProtectedRoute allowedRoles={[ROLES.USER, ROLES.ADMIN, ROLES.MASTER_ADMIN]}>
              <UsersPage />
            </ProtectedRoute>
          }
        />

        {/* Trang ADMIN */}
        <Route
          path={ROUTES.ADMIN}
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MASTER_ADMIN]}>
              <AdminPage />
            </ProtectedRoute>
          }
        />

        {/* Trang MASTER_ADMIN */}
        <Route
          path={ROUTES.MASTER_ADMIN}
          element={
            <ProtectedRoute allowedRoles={[ROLES.MASTER_ADMIN]}>
              <MasterAdminPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Tuyến công khai & Lỗi (Public Layout) */}
      <Route element={<PublicLayout />}>
        <Route path={ROUTES.FORBIDDEN} element={<ForbiddenPage />} />
        <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default AppRouter;

