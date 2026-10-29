import React, { useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import PersonIcon from "@mui/icons-material/Person";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BlockIcon from "@mui/icons-material/Block";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import SchoolIcon from "@mui/icons-material/School";
import HistoryIcon from "@mui/icons-material/History";
import SecurityIcon from "@mui/icons-material/Security";

export default function UserDashboardPage({ user, token, onLogout, onTestApi }) {
  const [testResult, setTestResult] = useState(null);

  async function handleTestUserApi() {
    const res = await onTestApi("Gọi API Profile Người Dùng", "/api/user/profile");
    setTestResult(res);
  }

  async function handleTestAdminApiForbidden() {
    const res = await onTestApi("Thử truy cập trái phép API Admin", "/api/admin/dashboard");
    setTestResult(res);
  }

  return (
    <Box sx={{ pb: 6 }}>
      {/* BANNER GIAO DIỆN USER */}
      <Paper
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 3,
          bgcolor: "#f0fdf4",
          border: "1px solid #bbf7d0",
          boxShadow: "0 4px 12px rgba(22, 163, 74, 0.08)",
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={2}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              src={user.avatar}
              sx={{ width: 64, height: 64, border: "3px solid #16a34a", bgcolor: "#16a34a" }}
            >
              <PersonIcon sx={{ fontSize: 36 }} />
            </Avatar>
            <Box>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="h5" fontWeight={800} color="#15803d">
                  TRANG MẪU: USER DASHBOARD
                </Typography>
                <Chip
                  icon={<PersonIcon />}
                  label="ROLE: USER"
                  sx={{ bgcolor: "#22c55e", color: "#fff", fontWeight: 700 }}
                />
              </Stack>
              <Typography variant="body2" color="#166534" sx={{ mt: 0.5 }}>
                Xin chào, <strong>{user.name}</strong> ({user.email}) · Đăng nhập với quyền Người dùng tiêu chuẩn
              </Typography>
            </Box>
          </Stack>

          {/* NÚT ĐĂNG XUẤT CHO USER */}
          <Button
            variant="contained"
            color="error"
            size="large"
            startIcon={<ExitToAppIcon />}
            onClick={onLogout}
            sx={{
              fontWeight: 700,
              bgcolor: "#dc2626",
              "&:hover": { bgcolor: "#b91c1c" },
              px: 3,
              py: 1.2,
              borderRadius: 2,
              boxShadow: 3,
            }}
          >
            Đăng xuất USER (Ban qua Redis)
          </Button>
        </Stack>
      </Paper>

      {/* NỘI DUNG CHÍNH CỦA TRANG USER */}
      <Grid container spacing={3}>
        {/* CỘT 1: THÔNG TIN HỒ SƠ & GÓI TÀI KHOẢN */}
        <Grid item xs={12} md={5}>
          <Card sx={{ borderRadius: 3, boxShadow: 2, height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} color="#15803d" gutterBottom>
                Hồ Sơ & Quyền Hạn Cá Nhân
              </Typography>
              <Divider sx={{ mb: 2.5 }} />

              <Stack spacing={2}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="body2" color="text.secondary">Mã định danh (User ID):</Typography>
                  <Typography variant="body2" fontWeight={700} fontFamily="monospace">{user.id}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="body2" color="text.secondary">Email đăng ký:</Typography>
                  <Typography variant="body2" fontWeight={600}>{user.email}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="body2" color="text.secondary">Phương thức xác thực:</Typography>
                  <Chip
                    label={user.provider === "google" ? "Google SSO" : "Email & Mật khẩu"}
                    size="small"
                    color={user.provider === "google" ? "error" : "default"}
                  />
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="body2" color="text.secondary">Cấp bậc truy cập (RBAC):</Typography>
                  <Chip label="Cấp 1 · USER" size="small" sx={{ bgcolor: "#dcfce7", color: "#15803d", fontWeight: 700 }} />
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="body2" color="text.secondary">Trạng thái tài khoản:</Typography>
                  <Chip icon={<CheckCircleIcon />} label="Đang hoạt động" size="small" color="success" />
                </Box>
              </Stack>

              <Divider sx={{ my: 2.5 }} />

              <Alert severity="info" sx={{ fontSize: "0.85rem" }}>
                Tài khoản <strong>USER</strong> được cấp Token truy cập 15 phút. Bạn có quyền xem tài nguyên cá nhân, nhưng bị chặn khi truy cập trang Quản Trị hoặc Cấu hình Hệ thống.
              </Alert>
            </CardContent>
          </Card>
        </Grid>

        {/* CỘT 2: TÍNH NĂNG USER & THỬ NGHIỆM RANH GIỚI RBAC */}
        <Grid item xs={12} md={7}>
          <Card sx={{ borderRadius: 3, boxShadow: 2, height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} color="#15803d" gutterBottom>
                Khu Vực Tính Năng Người Dùng & Thử Nghiệm RBAC
              </Typography>
              <Divider sx={{ mb: 2.5 }} />

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, textAlign: "center" }}>
                    <SchoolIcon sx={{ color: "#16a34a", fontSize: 32 }} />
                    <Typography variant="subtitle2" fontWeight={700} mt={1}>Tài Liệu Của Tôi</Typography>
                    <Typography variant="caption" color="text.secondary">Đã kích hoạt quyền đọc</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, textAlign: "center" }}>
                    <HistoryIcon sx={{ color: "#0284c7", fontSize: 32 }} />
                    <Typography variant="subtitle2" fontWeight={700} mt={1}>Lịch Sử Phiên</Typography>
                    <Typography variant="caption" color="text.secondary">Được bảo vệ bởi JWT</Typography>
                  </Paper>
                </Grid>
              </Grid>

              {/* NÚT THỬ NGHIỆM QUYỀN HẠN RBAC */}
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                Thử nghiệm phân quyền trực tiếp (RBAC Test):
              </Typography>
              <Stack spacing={1.5} sx={{ mb: 2 }}>
                <Button
                  variant="outlined"
                  color="success"
                  fullWidth
                  onClick={handleTestUserApi}
                  startIcon={<CheckCircleIcon />}
                  sx={{ justifyContent: "flex-start", py: 1 }}
                >
                  1. Gọi API của User (/api/user/profile) $\rightarrow$ Kỳ vọng: 200 OK
                </Button>

                <Button
                  variant="outlined"
                  color="error"
                  fullWidth
                  onClick={handleTestAdminApiForbidden}
                  startIcon={<BlockIcon />}
                  sx={{ justifyContent: "flex-start", py: 1 }}
                >
                  2. Thử truy cập API của Admin (/api/admin/dashboard) $\rightarrow$ Kỳ vọng: 403 Forbidden
                </Button>
              </Stack>

              {testResult && (
                <Paper sx={{ p: 2, bgcolor: "#0f172a", color: "#f8fafc", borderRadius: 2 }}>
                  <Typography variant="caption" color={testResult.status === 200 ? "#4ade80" : "#f87171"} fontWeight={700}>
                    HTTP STATUS: [{testResult.status}] - {testResult.endpoint}
                  </Typography>
                  <pre style={{ margin: "6px 0 0 0", fontSize: "0.78rem", color: "#93c5fd" }}>
                    {JSON.stringify(testResult.data, null, 2)}
                  </pre>
                </Paper>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

