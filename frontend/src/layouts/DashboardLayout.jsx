import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Chip,
  Container,
  Toolbar,
  Typography,
} from "@mui/material";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import SecurityIcon from "@mui/icons-material/Security";
import { useAuth } from "../hooks/useAuth.js";
import { ROUTES } from "../constants/routes.js";
import { ROLES } from "../constants/roles.js";

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN);
  };

  const getRoleColor = (role) => {
    switch (role) {
      case ROLES.MASTER_ADMIN:
        return { bg: "#dc2626", color: "#fff" };
      case ROLES.ADMIN:
        return { bg: "#2563eb", color: "#fff" };
      case ROLES.USER:
      default:
        return { bg: "#16a34a", color: "#fff" };
    }
  };

  const roleStyle = getRoleColor(user?.role);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc", display: "flex", flexDirection: "column" }}>
      <AppBar position="static" sx={{ bgcolor: "#0f172a" }} elevation={1}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          {/* Logo & Tiêu đề */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <SecurityIcon sx={{ color: "#38bdf8", fontSize: 28 }} />
            <Typography variant="h6" fontWeight={700} color="#fff">
              Auth RBAC System
            </Typography>
          </Box>

          {/* User Info & Nút Đăng xuất */}
          {user && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box sx={{ display: { xs: "none", sm: "flex" }, alignItems: "center", gap: 1 }}>
                <Avatar
                  sx={{ width: 32, height: 32, bgcolor: "#334155", fontSize: "0.85rem" }}
                  src={user.avatar}
                >
                  {user.name?.[0] || user.email?.[0]}
                </Avatar>
                <Typography variant="body2" color="#e2e8f0" fontWeight={600}>
                  {user.name || user.email}
                </Typography>
              </Box>

              <Chip
                label={user.role}
                size="small"
                sx={{
                  bgcolor: roleStyle.bg,
                  color: roleStyle.color,
                  fontWeight: 700,
                  fontSize: "0.75rem",
                }}
              />

              <Button
                variant="outlined"
                color="error"
                size="small"
                startIcon={<ExitToAppIcon />}
                onClick={handleLogout}
                sx={{
                  borderColor: "rgba(239, 68, 68, 0.5)",
                  color: "#f87171",
                  "&:hover": {
                    borderColor: "#ef4444",
                    bgcolor: "rgba(239, 68, 68, 0.1)",
                  },
                }}
              >
                Đăng Xuất
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Nội dung trang */}
      <Container maxWidth="lg" sx={{ flex: 1, py: 4 }}>
        <Outlet />
      </Container>
    </Box>
  );
}

