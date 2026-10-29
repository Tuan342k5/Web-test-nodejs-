import React, { useEffect, useState } from "react";
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
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";

import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import StorageIcon from "@mui/icons-material/Storage";
import RefreshIcon from "@mui/icons-material/Refresh";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SecurityIcon from "@mui/icons-material/Security";
import SpeedIcon from "@mui/icons-material/Speed";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";

export default function MasterAdminDashboardPage({
  user,
  token,
  onLogout,
  onTestApi,
  usersList,
  onRefreshUsers,
  onToggleStatus,
  onUpdateRole,
  redisInfo,
  blacklistedTokens,
  onRefreshBlacklist,
}) {
  const [testResult, setTestResult] = useState(null);
  const [usersPage, setUsersPage] = useState(0);
  const [usersPerPage, setUsersPerPage] = useState(5);

  const pagedUsers = usersList.slice(
    usersPage * usersPerPage,
    usersPage * usersPerPage + usersPerPage,
  );

  useEffect(() => {
    const lastPage = Math.max(0, Math.ceil(usersList.length / usersPerPage) - 1);
    if (usersPage > lastPage) setUsersPage(lastPage);
  }, [usersList.length, usersPage, usersPerPage]);

  async function handleTestAllApis(endpointName, url) {
    const res = await onTestApi(endpointName, url);
    setTestResult(res);
  }

  return (
    <Box sx={{ pb: 6 }}>
      {/* BANNER GIAO DIỆN MASTER_ADMIN */}
      <Paper
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 3,
          background: "linear-gradient(135deg, #450a0a 0%, #1e1b4b 100%)",
          color: "#fff",
          border: "1px solid #7f1d1d",
          boxShadow: "0 8px 24px rgba(127, 29, 29, 0.25)",
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
              sx={{ width: 68, height: 68, border: "3px solid #facc15", bgcolor: "#b91c1c" }}
            >
              <AdminPanelSettingsIcon sx={{ fontSize: 40, color: "#facc15" }} />
            </Avatar>
            <Box>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="h5" fontWeight={900} sx={{ color: "#fde047", letterSpacing: "0.5px" }}>
                  TRANG MẪU: MASTER ADMIN CONSOLE
                </Typography>
                <Chip
                  icon={<AdminPanelSettingsIcon sx={{ color: "#fef08a !important" }} />}
                  label="MASTER_ADMIN TỐI CAO"
                  sx={{
                    bgcolor: "#991b1b",
                    color: "#fef08a",
                    fontWeight: 800,
                    border: "1px solid #facc15",
                  }}
                />
              </Stack>
              <Typography variant="body2" sx={{ color: "#cbd5e1", mt: 0.5 }}>
                Tổng quản trị: <strong>{user.name}</strong> ({user.email}) · Toàn quyền điều khiển hệ thống, giám sát Redis & phân quyền RBAC
              </Typography>
            </Box>
          </Stack>

          {/* NÚT ĐĂNG XUẤT CHO MASTER ADMIN */}
          <Button
            variant="contained"
            color="error"
            size="large"
            startIcon={<ExitToAppIcon />}
            onClick={onLogout}
            sx={{
              fontWeight: 800,
              bgcolor: "#ef4444",
              "&:hover": { bgcolor: "#dc2626" },
              px: 3.5,
              py: 1.3,
              borderRadius: 2,
              boxShadow: "0 4px 14px rgba(239, 68, 68, 0.4)",
              border: "1px solid #fca5a5",
            }}
          >
            Đăng xuất MASTER (Ban qua Redis)
          </Button>
        </Stack>
      </Paper>

      {/* THÔNG TIN HỆ THỐNG & REDIS MONITOR */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: 2, height: "100%", borderTop: "4px solid #dc2626" }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <StorageIcon color="error" />
                  <Typography variant="h6" fontWeight={700}>
                    Giám Sát Redis Blacklist Trực Tiếp
                  </Typography>
                </Stack>
                <IconButton onClick={onRefreshBlacklist} color="error">
                  <RefreshIcon />
                </IconButton>
              </Stack>

              <Alert severity={redisInfo?.connected ? "success" : "warning"} sx={{ mb: 2 }}>
                <strong>Trạng thái Redis:</strong> {redisInfo?.connected ? "Đã kết nối Redis Server thật tại " + redisInfo.redisUrl : "Chế độ In-Memory Fallback (Thu hồi token tự động theo TTL)"}
              </Alert>

              <Typography variant="body2" color="text.secondary" mb={1.5}>
                Tổng số Access Token đang bị vô hiệu hóa trong Redis: <strong>{blacklistedTokens.length}</strong>
              </Typography>

              {blacklistedTokens.length === 0 ? (
                <Paper variant="outlined" sx={{ p: 3, textAlign: "center", bgcolor: "#f8fafc", borderRadius: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Chưa có token nào trong blacklist. Hãy thử bấm <strong>Đăng xuất</strong> để xem Token xuất hiện tại đây ngay lập tức!
                  </Typography>
                </Paper>
              ) : (
                <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 220, borderRadius: 2 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>JTI / Key Bị Ban</strong></TableCell>
                        <TableCell><strong>Email</strong></TableCell>
                        <TableCell><strong>Role</strong></TableCell>
                        <TableCell><strong>TTL Còn</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {blacklistedTokens.map((t, idx) => (
                        <TableRow key={idx}>
                          <TableCell sx={{ fontFamily: "monospace", fontSize: "0.75rem" }}>
                            {t.key.length > 20 ? t.key.slice(0, 18) + "..." : t.key}
                          </TableCell>
                          <TableCell sx={{ fontSize: "0.8rem" }}>{t.email}</TableCell>
                          <TableCell>
                            <Chip label={t.role} size="small" color="error" variant="outlined" />
                          </TableCell>
                          <TableCell>
                            <Chip label={`${t.remainingSeconds}s`} size="small" color="error" />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: 2, height: "100%", borderTop: "4px solid #7c3aed" }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                <SpeedIcon sx={{ color: "#7c3aed" }} />
                <Typography variant="h6" fontWeight={700}>
                  Kiểm Chứng Toàn Quyền RBAC (Master Access)
                </Typography>
              </Stack>

              <Typography variant="body2" color="text.secondary" mb={2}>
                Là <strong>MASTER_ADMIN</strong>, bạn được phép truy cập tất cả các API mà không bị chặn bởi bất kỳ phân quyền nào:
              </Typography>

              <Stack spacing={1.5} sx={{ mb: 2 }}>
                <Button
                  variant="outlined"
                  color="success"
                  fullWidth
                  onClick={() => handleTestAllApis("User API", "/api/user/profile")}
                  sx={{ justifyContent: "flex-start" }}
                >
                  ✓ Gọi User API (/api/user/profile) $\rightarrow$ 200 OK
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  fullWidth
                  onClick={() => handleTestAllApis("Admin API", "/api/admin/dashboard")}
                  sx={{ justifyContent: "flex-start" }}
                >
                  ✓ Gọi Admin API (/api/admin/dashboard) $\rightarrow$ 200 OK
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  fullWidth
                  onClick={() => handleTestAllApis("Master API", "/api/admin/master")}
                  sx={{ justifyContent: "flex-start" }}
                >
                  ✓ Gọi Master API (/api/admin/master) $\rightarrow$ 200 OK
                </Button>
              </Stack>

              {testResult && (
                <Paper sx={{ p: 1.5, bgcolor: "#0f172a", color: "#f8fafc", borderRadius: 2 }}>
                  <Typography variant="caption" color="#4ade80" fontWeight={700}>
                    STATUS [{testResult.status} OK] - {testResult.endpoint}
                  </Typography>
                  <pre style={{ margin: "4px 0 0 0", fontSize: "0.75rem", color: "#93c5fd" }}>
                    {JSON.stringify(testResult.data, null, 2)}
                  </pre>
                </Paper>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* BẢNG ĐIỀU KHIỂN PHÂN QUYỀN RBAC (THAY ĐỔI ROLE MỌI NGƯỜI DÙNG) */}
      <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Stack direction="row" spacing={1} alignItems="center">
              <ManageAccountsIcon color="error" />
              <Typography variant="h6" fontWeight={700}>
                Bảng Phân Quyền & Cấp Vai Trò Người Dùng (RBAC Controller)
              </Typography>
            </Stack>
            <IconButton onClick={onRefreshUsers}>
              <RefreshIcon />
            </IconButton>
          </Stack>

          <Alert severity="info" sx={{ mb: 2 }}>
            <strong>Đặc quyền Master Admin:</strong> Bấm vào nút vai trò của bất kỳ người dùng nào để thăng cấp hoặc hạ cấp quyền (`USER` $\leftrightarrow$ `ADMIN` $\leftrightarrow$ `MASTER_ADMIN`).
          </Alert>

          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: "#f8fafc" }}>
                <TableRow>
                  <TableCell><strong>Người Dùng</strong></TableCell>
                  <TableCell><strong>Email</strong></TableCell>
                  <TableCell><strong>Vai Trò Hiện Tại</strong></TableCell>
                  <TableCell><strong>Đổi Vai Trò (1-Click)</strong></TableCell>
                  <TableCell align="right"><strong>Trạng Thái & Khóa</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pagedUsers.map((u) => (
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
                        sx={{ fontWeight: 800 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Button
                          size="small"
                          variant={u.role === "USER" ? "contained" : "outlined"}
                          color="success"
                          onClick={() => onUpdateRole(u.id, "USER")}
                          sx={{ py: 0.2, fontSize: "0.75rem" }}
                        >
                          Gán USER
                        </Button>
                        <Button
                          size="small"
                          variant={u.role === "ADMIN" ? "contained" : "outlined"}
                          color="primary"
                          onClick={() => onUpdateRole(u.id, "ADMIN")}
                          sx={{ py: 0.2, fontSize: "0.75rem" }}
                        >
                          Gán ADMIN
                        </Button>
                        <Button
                          size="small"
                          variant={u.role === "MASTER_ADMIN" ? "contained" : "outlined"}
                          color="error"
                          onClick={() => onUpdateRole(u.id, "MASTER_ADMIN")}
                          sx={{ py: 0.2, fontSize: "0.75rem" }}
                        >
                          Gán MASTER
                        </Button>
                      </Stack>
                    </TableCell>
                    <TableCell align="right">
                      {u.role !== "MASTER_ADMIN" ? (
                        <Button
                          size="small"
                          color={u.active ? "error" : "success"}
                          onClick={() => onToggleStatus(u.id)}
                        >
                          {u.active ? "Khóa" : "Kích hoạt"}
                        </Button>
                      ) : (
                        <Typography variant="caption" color="text.secondary">Master vĩnh viễn</Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={usersList.length}
            page={usersPage}
            onPageChange={(_, page) => setUsersPage(page)}
            rowsPerPage={usersPerPage}
            onRowsPerPageChange={(event) => {
              setUsersPerPage(Number(event.target.value));
              setUsersPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25]}
            labelRowsPerPage="Số người dùng mỗi trang:"
            labelDisplayedRows={({ from, to, count }) => `${from}–${to} trên ${count}`}
          />
        </CardContent>
      </Card>
    </Box>
  );
}

