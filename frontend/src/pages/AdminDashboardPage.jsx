import React, { useState, useEffect } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";

import ShieldIcon from "@mui/icons-material/Shield";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BlockIcon from "@mui/icons-material/Block";
import RefreshIcon from "@mui/icons-material/Refresh";
import GroupIcon from "@mui/icons-material/Group";
import LockPersonIcon from "@mui/icons-material/LockPerson";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";

export default function AdminDashboardPage({
  user,
  token,
  onLogout,
  onTestApi,
  usersList,
  onRefreshUsers,
  onToggleStatus,
}) {
  const [testResult, setTestResult] = useState(null);

  const totalUsers = usersList.length;
  const activeUsers = usersList.filter((u) => u.active).length;
  const lockedUsers = totalUsers - activeUsers;

  async function handleTestAdminApi() {
    const res = await onTestApi("Gọi API Quản Trị Viên", "/api/admin/dashboard");
    setTestResult(res);
  }

  async function handleTestMasterApiForbidden() {
    const res = await onTestApi("Thử truy cập trái phép API Master Admin", "/api/admin/master");
    setTestResult(res);
  }

  return (
    <Box sx={{ pb: 6 }}>
      {/* BANNER GIAO DIỆN ADMIN */}
      <Paper
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 3,
          bgcolor: "#eff6ff",
          border: "1px solid #bfdbfe",
          boxShadow: "0 4px 12px rgba(37, 99, 235, 0.08)",
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
              sx={{ width: 64, height: 64, border: "3px solid #2563eb", bgcolor: "#2563eb" }}
            >
              <ShieldIcon sx={{ fontSize: 36 }} />
            </Avatar>
            <Box>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="h5" fontWeight={800} color="#1e40af">
                  TRANG MẪU: ADMIN DASHBOARD
                </Typography>
                <Chip
                  icon={<ShieldIcon />}
                  label="ROLE: ADMIN"
                  sx={{ bgcolor: "#2563eb", color: "#fff", fontWeight: 700 }}
                />
              </Stack>
              <Typography variant="body2" color="#1e3a8a" sx={{ mt: 0.5 }}>
                Quản trị viên: <strong>{user.name}</strong> ({user.email}) · Quyền quản lý người dùng trong hệ thống
              </Typography>
            </Box>
          </Stack>

          {/* NÚT ĐĂNG XUẤT CHO ADMIN */}
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
            Đăng xuất ADMIN (Ban qua Redis)
          </Button>
        </Stack>
      </Paper>

      {/* THẺ THỐNG KÊ NHANH */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderRadius: 3, borderLeft: "5px solid #2563eb", boxShadow: 2 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    TỔNG NGƯỜI DÙNG
                  </Typography>
                  <Typography variant="h4" fontWeight={800} color="#1e40af">
                    {totalUsers}
                  </Typography>
                </Box>
                <GroupIcon sx={{ fontSize: 40, color: "#93c5fd" }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card sx={{ borderRadius: 3, borderLeft: "5px solid #16a34a", boxShadow: 2 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    ĐANG HOẠT ĐỘNG
                  </Typography>
                  <Typography variant="h4" fontWeight={800} color="#16a34a">
                    {activeUsers}
                  </Typography>
                </Box>
                <CheckCircleIcon sx={{ fontSize: 40, color: "#86efac" }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card sx={{ borderRadius: 3, borderLeft: "5px solid #dc2626", boxShadow: 2 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    ĐÃ BỊ TẠM KHÓA
                  </Typography>
                  <Typography variant="h4" fontWeight={800} color="#dc2626">
                    {lockedUsers}
                  </Typography>
                </Box>
                <LockPersonIcon sx={{ fontSize: 40, color: "#fca5a5" }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* BẢNG QUẢN LÝ NGƯỜI DÙNG (ADMIN CAPABILITY) */}
      <Card sx={{ borderRadius: 3, boxShadow: 2, mb: 4 }}>
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Box>
              <Typography variant="h6" fontWeight={700} color="#1e40af">
                Danh Sách Người Dùng Trong Database (Cập nhật Realtime)
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Admin có quyền Khóa / Mở khóa tài khoản của người dùng
              </Typography>
            </Box>
            <IconButton onClick={onRefreshUsers} color="primary">
              <RefreshIcon />
            </IconButton>
          </Stack>

          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: "#f8fafc" }}>
                <TableRow>
                  <TableCell><strong>Họ Tên</strong></TableCell>
                  <TableCell><strong>Email</strong></TableCell>
                  <TableCell><strong>Vai Trò</strong></TableCell>
                  <TableCell><strong>Xác Thực</strong></TableCell>
                  <TableCell><strong>Trạng Thái</strong></TableCell>
                  <TableCell align="right"><strong>Hành Động Khóa/Mở</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {usersList.map((u) => (
                  <TableRow key={u.id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Avatar src={u.avatar} sx={{ width: 28, height: 28 }} />
                        <Typography variant="body2" fontWeight={600}>{u.name}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={u.role}
                        size="small"
                        color={u.role === "MASTER_ADMIN" ? "error" : u.role === "ADMIN" ? "primary" : "success"}
                        sx={{ fontWeight: 700 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip label={u.provider} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={u.active ? "Hoạt động" : "Bị khóa"}
                        size="small"
                        color={u.active ? "success" : "default"}
                      />
                    </TableCell>
                    <TableCell align="right">
                      {u.role !== "MASTER_ADMIN" ? (
                        <Button
                          size="small"
                          variant="outlined"
                          color={u.active ? "error" : "success"}
                          onClick={() => onToggleStatus(u.id)}
                          sx={{ textTransform: "none", fontWeight: 600 }}
                        >
                          {u.active ? "Khóa tài khoản" : "Mở khóa"}
                        </Button>
                      ) : (
                        <Typography variant="caption" color="text.secondary">Không thể khóa Master</Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* THỬ NGHIỆM RANH GIỚI RBAC GIỮA ADMIN VÀ MASTER_ADMIN */}
      <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={700} color="#1e40af" gutterBottom>
            Kiểm Chứng Ranh Giới Quyền Hạn (RBAC Testing cho Admin)
          </Typography>
          <Divider sx={{ mb: 2.5 }} />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleTestAdminApi}
              startIcon={<CheckCircleIcon />}
              sx={{ fontWeight: 600 }}
            >
              1. Gọi API của Admin (/api/admin/dashboard) $\rightarrow$ Kỳ vọng: 200 OK
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={handleTestMasterApiForbidden}
              startIcon={<BlockIcon />}
              sx={{ fontWeight: 600 }}
            >
              2. Thử truy cập API của Master (/api/admin/master) $\rightarrow$ Kỳ vọng: 403 Forbidden
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
    </Box>
  );
}

