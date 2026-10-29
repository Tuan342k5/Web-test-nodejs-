import React from "react";
import { Box, Button, Card, CardContent, Chip, Container, Stack, Typography } from "@mui/material";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

export default function MasterAdminPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#fef2f2", display: "flex", alignItems: "center", py: 4 }}>
      <Container maxWidth="sm">
        <Card sx={{ borderRadius: 4, boxShadow: 3, textAlign: "center", p: 2 }}>
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Stack spacing={3} alignItems="center">
              <Box sx={{ bgcolor: "#fee2e2", p: 2, borderRadius: "50%", display: "inline-flex" }}>
                <AdminPanelSettingsIcon sx={{ fontSize: 48, color: "#dc2626" }} />
              </Box>

              <Chip
                label="ROLE: MASTER_ADMIN"
                sx={{ bgcolor: "#dc2626", color: "#fff", fontWeight: 700, fontSize: "0.9rem" }}
              />

              <Typography variant="h5" fontWeight={700} color="#991b1b">
                Xin chào, {user?.name || user?.email}!
              </Typography>

              <Typography variant="body1" color="text.secondary">
                Bạn đang ở trang dành cho quyền <strong>MASTER_ADMIN (Tổng quản trị)</strong>.
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
      </Container>
    </Box>
  );
}

