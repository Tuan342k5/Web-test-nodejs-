import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { getDefaultRouteForRole } from "../../constants/routes.js";
import Loading from "../../components/common/Loading.jsx";

export default function DashboardPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (user) {
    return <Navigate to={getDefaultRouteForRole(user.role)} replace />;
  }

  return <Navigate to="/login" replace />;
}

