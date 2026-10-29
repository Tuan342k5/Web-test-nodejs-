import React from "react";
import { Box, Button, Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { useAuth } from "../../hooks/useAuth.js";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../constants/routes.js";

export default function AdminPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate(ROUTES.LOGIN);
  }

  return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "70vh" }}>
      <Card sx={{ maxWidth: 500, width: "100%", borderRadius: 4, boxShadow: 3, textAlign: "center", p: 2 }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Stack spacing={3} alignItems="center">
            <Box sx={{ bgcolor: "#dbeafe", p: 2, borderRadius: "50%", display: "inline-flex" }}>
              <AdminPanelSettingsIcon sx={{ fontSize: 52, color: "#2563eb" }} />
            </Box>

            <Chip
              label="VAI TRÒ: ADMIN"
              sx={{ bgcolor: "#2563eb", color: "#fff", fontWeight: 700, fontSize: "0.9rem" }}
            />

            <Typography variant="h5" fontWeight={700} color="#1d4ed8">
              Xin chào, {user?.name || user?.email}!
            </Typography>

            <Typography variant="body1" color="text.secondary">
              Bạn đang ở trang dành cho quyền <strong>ADMIN (Quản trị viên)</strong>.
            </Typography>

            <Button
              variant="contained"
              color="error"
              size="large"
              startIcon={<ExitToAppIcon />}
              onClick={handleLogout}
              sx={{ px: 4, py: 1.2, fontWeight: 700, borderRadius: 2 }}
            >
              Đăng Xuất
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

