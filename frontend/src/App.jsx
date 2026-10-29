import React, { useState, useEffect } from "react";
import {
  Alert,
  AppBar,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";

// Icons
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import GoogleIcon from "@mui/icons-material/Google";
import KeyIcon from "@mui/icons-material/Key";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import PersonIcon from "@mui/icons-material/Person";
import RefreshIcon from "@mui/icons-material/Refresh";
import SecurityIcon from "@mui/icons-material/Security";
import ShieldIcon from "@mui/icons-material/Shield";
import StorageIcon from "@mui/icons-material/Storage";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import VpnKeyIcon from "@mui/icons-material/VpnKey";

const API_URL = "http://localhost:3000";

// Màu nhận diện cho từng vai trò
const ROLE_CONFIG = {
  MASTER_ADMIN: {
    label: "MASTER_ADMIN",
    color: "#d32f2f",
    bgColor: "#ffebee",
    icon: <AdminPanelSettingsIcon fontSize="small" />,
    description: "Toàn quyền hệ thống, quản lý phân quyền và giám sát Redis",
  },
  ADMIN: {
    label: "ADMIN",
    color: "#1976d2",
    bgColor: "#e3f2fd",
    icon: <ShieldIcon fontSize="small" />,
    description: "Quản trị người dùng, khóa/mở khóa tài khoản",
  },
  USER: {
    label: "USER",
    color: "#2e7d32",
    bgColor: "#e8f5e9",
    icon: <PersonIcon fontSize="small" />,
    description: "Người dùng cơ bản, xem thông tin cá nhân",
  },
};

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem("accessToken") || "");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");

  // Tabs
  const [loginTab, setLoginTab] = useState(0); // 0: Password, 1: Google SSO
  const [dashboardTab, setDashboardTab] = useState(0); // 0: Profile, 1: Admin, 2: Master, 3: Lab

  // Login form state
  const [email, setEmail] = useState("master@example.com");
  const [password, setPassword] = useState("User123!");
  const [ssoEmail, setSsoEmail] = useState("newbie.google@gmail.com");
  const [ssoName, setSsoName] = useState("Google User Demo");

  // Admin / Master Data
  const [usersList, setUsersList] = useState([]);
  const [redisInfo, setRedisInfo] = useState(null);
  const [blacklistedTokens, setBlacklistedTokens] = useState([]);
  const [refreshingData, setRefreshingData] = useState(false);

  // Security Lab state (Thử nghiệm Redis Ban và RBAC)
  const [savedOldToken, setSavedOldToken] = useState("");
  const [apiLogs, setApiLogs] = useState([]);

  // Tự động kiểm tra Token khi mở trang
  useEffect(() => {
    if (token) {
      fetchCurrentUser(token);
      fetchRedisStatus();
    } else {
      fetchRedisStatus();
    }
  }, [token]);

  // Lấy thông tin user hiện tại qua Token
  async function fetchCurrentUser(authToken) {
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.data.user);
      } else {
        // Token hết hạn hoặc bị Redis ban
        handleForceLogout(data.message || "Phiên đăng nhập đã hết hạn.");
      }
    } catch (err) {
      console.error("Lỗi xác thực token:", err);
    }
  }

  // Lấy trạng thái Redis
  async function fetchRedisStatus() {
    try {
      const res = await fetch(`${API_URL}/api/auth/redis-status`);
      const data = await res.json();
      if (res.ok) {
        setRedisInfo(data.data);
      }
    } catch (err) {
      console.warn("Không kết nối được API Redis status:", err.message);
    }
  }

  // Lấy danh sách người dùng (dành cho Admin / Master)
  async function fetchUsers() {
    if (!token) return;
    setRefreshingData(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setUsersList(data.data);
      }
    } catch (err) {
      console.error("Lỗi lấy danh sách users:", err);
    } finally {
      setRefreshingData(false);
    }
  }

  // Lấy danh sách Redis Blacklist (chỉ dành cho Master Admin)
  async function fetchBlacklist() {
    if (!token || user?.role !== "MASTER_ADMIN") return;
    setRefreshingData(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/master/blacklist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setBlacklistedTokens(data.data.blacklistedTokens || []);
        setRedisInfo(data.data.redisStatus);
      }
    } catch (err) {
      console.error("Lỗi lấy danh sách blacklist:", err);
    } finally {
      setRefreshingData(false);
    }
  }

  useEffect(() => {
    if (user) {
      if (dashboardTab === 1 && (user.role === "ADMIN" || user.role === "MASTER_ADMIN")) {
        fetchUsers();
      }
      if (dashboardTab === 2 && user.role === "MASTER_ADMIN") {
        fetchBlacklist();
        fetchUsers();
      }
    }
  }, [dashboardTab, user]);

  // Xử lý Đăng nhập thường
  async function handlePasswordLogin(e) {
    e.preventDefault();
    setLoading(true);
    setAuthError("");
    setAuthSuccess("");

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || "Đăng nhập thất bại.");
      }

      const receivedToken = result.data.accessToken;
      localStorage.setItem("accessToken", receivedToken);
      setToken(receivedToken);
      setUser(result.data.user);
      setAuthSuccess("Đăng nhập thành công!");
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Xử lý Đăng nhập Google SSO (Tự động đăng ký vào DB nếu tài khoản mới)
  async function handleSsoLogin(targetEmail, targetName, targetRole) {
    setLoading(true);
    setAuthError("");
    setAuthSuccess("");

    try {
      const res = await fetch(`${API_URL}/api/auth/sso/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: targetEmail || ssoEmail,
          name: targetName || ssoName,
          role: targetRole,
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || "Đăng nhập SSO thất bại.");
      }

      const receivedToken = result.data.accessToken;
      localStorage.setItem("accessToken", receivedToken);
      setToken(receivedToken);
      setUser(result.data.user);

      if (result.data.isNewAccount) {
        setAuthSuccess(`🎉 Đã tự động tạo tài khoản mới vào Database cho ${result.data.user.email} (${result.data.user.role})!`);
      } else {
        setAuthSuccess(`Đăng nhập Google SSO thành công: Xin chào ${result.data.user.name}!`);
      }
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Xử lý Đăng xuất & Đưa Token vào Redis Blacklist
  async function handleLogout() {
    setLoading(true);
    try {
      if (token) {
        // Lưu lại bản sao token trước khi đăng xuất để hỗ trợ kiểm thử Redis Ban
        setSavedOldToken(token);

        await fetch(`${API_URL}/api/auth/logout`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (err) {
      console.warn("Lỗi gọi logout API:", err.message);
    } finally {
      localStorage.removeItem("accessToken");
      setToken("");
      setUser(null);
      setLoading(false);
      setAuthSuccess("Đã đăng xuất! Token vừa dùng đã được đưa vào Redis Blacklist.");
    }
  }

  function handleForceLogout(reason) {
    localStorage.removeItem("accessToken");
    setToken("");
    setUser(null);
    setAuthError(reason);
  }

  // Khóa / Mở khóa tài khoản (Admin action)
  async function handleToggleStatus(userId) {
    try {
      const res = await fetch(`${API_URL}/api/admin/users/${userId}/status`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setAuthSuccess(data.message);
        fetchUsers();
      } else {
        setAuthError(data.message);
      }
    } catch (err) {
      setAuthError(err.message);
    }
  }

  // Đổi vai trò tài khoản (Master Admin action)
  async function handleUpdateRole(userId, newRole) {
    try {
      const res = await fetch(`${API_URL}/api/admin/master/users/${userId}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (res.ok) {
        setAuthSuccess(data.message);
        fetchUsers();
      } else {
        setAuthError(data.message);
      }
    } catch (err) {
      setAuthError(err.message);
    }
  }

  // Gọi thử API để kiểm tra quyền RBAC và ghi log
  async function testApiEndpoint(endpointName, url, customToken = null) {
    const testAuthToken = customToken || token;
    const startTime = performance.now();
    try {
      const res = await fetch(`${API_URL}${url}`, {
        headers: { Authorization: testAuthToken ? `Bearer ${testAuthToken}` : "" },
      });
      const data = await res.json();
      const duration = Math.round(performance.now() - startTime);

      const logEntry = {
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        endpoint: endpointName,
        url,
        status: res.status,
        duration: `${duration}ms`,
        success: res.ok,
        data,
      };

      setApiLogs((prev) => [logEntry, ...prev.slice(0, 9)]);
    } catch (err) {
      setApiLogs((prev) => [
        {
          id: Date.now(),
          timestamp: new Date().toLocaleTimeString(),
          endpoint: endpointName,
          url,
          status: "LỖI KẾT NỐI",
          duration: "-",
          success: false,
          data: { message: err.message },
        },
        ...prev.slice(0, 9),
      ]);
    }
  }

  // Giải mã Token Payload để hiển thị trực quan
  function getDecodedToken(jwtString) {
    if (!jwtString) return null;
    try {
      const payloadBase64 = jwtString.split(".")[1];
      const decodedJson = atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/"));
      return JSON.parse(decodedJson);
    } catch {
      return null;
    }
  }

  const tokenPayload = getDecodedToken(token);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f0f2f5", pb: 8 }}>
      {/* HEADER APP BAR */}
      <AppBar position="static" sx={{ bgcolor: "#1e293b", boxShadow: 3 }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <SecurityIcon sx={{ color: "#38bdf8", fontSize: 32 }} />
            <Box>
              <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                Auth & RBAC Enterprise Portal
              </Typography>
              <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                Node.js Express + JWT + Redis Blacklist + SSO Google
              </Typography>
            </Box>
          </Stack>

          {/* Trạng thái Redis & User Chip */}
          <Stack direction="row" spacing={2} alignItems="center">
            {redisInfo && (
              <Tooltip title={`Redis Mode: ${redisInfo.mode} (${redisInfo.redisUrl || "localhost"})`}>
                <Chip
                  icon={<StorageIcon sx={{ fontSize: "16px !important" }} />}
                  label={redisInfo.connected ? "Redis: Đã kết nối" : "Redis: In-Memory Fallback"}
                  size="small"
                  sx={{
                    bgcolor: redisInfo.connected ? "#14532d" : "#7c2d12",
                    color: redisInfo.connected ? "#4ade80" : "#fdba74",
                    fontWeight: 600,
                  }}
                />
              </Tooltip>
            )}

            {user ? (
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar
                  src={user.avatar}
                  sx={{ width: 36, height: 36, border: "2px solid #38bdf8" }}
                >
                  {user.name?.charAt(0)}
                </Avatar>
                <Box sx={{ display: { xs: "none", sm: "block" } }}>
                  <Typography variant="body2" fontWeight={600} color="#fff">
                    {user.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#cbd5e1" }}>
                    {user.email}
                  </Typography>
                </Box>
                <Chip
                  icon={ROLE_CONFIG[user.role]?.icon}
                  label={user.role}
                  size="small"
                  sx={{
                    bgcolor: ROLE_CONFIG[user.role]?.bgColor,
                    color: ROLE_CONFIG[user.role]?.color,
                    fontWeight: 700,
                  }}
                />
                <Button
                  variant="outlined"
                  size="small"
                  color="error"
                  startIcon={<ExitToAppIcon />}
                  onClick={handleLogout}
                  sx={{ bgcolor: "rgba(239, 68, 68, 0.1)", borderColor: "#ef4444", color: "#fca5a5" }}
                >
                  Đăng xuất (Redis Ban)
                </Button>
              </Stack>
            ) : (
              <Chip label="Chưa đăng nhập" size="small" sx={{ bgcolor: "#334155", color: "#94a3b8" }} />
            )}
          </Stack>
        </Toolbar>
      </AppBar>

        {loading && <LinearProgress color="info" />}

      {/* THÔNG BÁO TOAST */}
      <Container maxWidth="lg" sx={{ mt: 3 }}>
        {authError && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setAuthError("")}>
            {authError}
          </Alert>
        )}
        {authSuccess && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setAuthSuccess("")}>
            {authSuccess}
          </Alert>
        )}

        {/* NẾU CHƯA ĐĂNG NHẬP: HIỂN THỊ MÀN HÌNH LOGIN / SSO */}
        {!user ? (
          <Box sx={{ maxWidth: 540, mx: "auto", mt: 4 }}>
            <Card sx={{ borderRadius: 4, boxShadow: 4, overflow: "hidden" }}>
              <Box sx={{ bgcolor: "#0f172a", color: "#fff", p: 3, textAlign: "center" }}>
                <Typography variant="h5" fontWeight={700}>
                  Cổng Đăng Nhập Xác Thực
                </Typography>
                <Typography variant="body2" sx={{ color: "#94a3b8", mt: 0.5 }}>
                  Hỗ trợ Mật khẩu chuẩn & Đăng nhập một lần (SSO Google)
                </Typography>
              </Box>

              <Tabs
                value={loginTab}
                onChange={(_, val) => setLoginTab(val)}
                variant="fullWidth"
                sx={{ borderBottom: 1, borderColor: "divider" }}
              >
                <Tab icon={<LockIcon />} iconPosition="start" label="Mật khẩu chuẩn" />
                <Tab icon={<GoogleIcon />} iconPosition="start" label="Google SSO" />
              </Tabs>

              <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                {loginTab === 0 ? (
                  /* TAB 1: FORM ĐĂNG NHẬP MẬT KHẨU */
                  <Box component="form" onSubmit={handlePasswordLogin}>
                    <Stack spacing={2.5}>
                      <TextField
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        fullWidth
                      />
                      <TextField
                        label="Mật khẩu"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        fullWidth
                      />

                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={loading}
                        sx={{ bgcolor: "#0284c7", "&:hover": { bgcolor: "#0369a1" }, py: 1.2 }}
                      >
                        {loading ? <CircularProgress size={24} color="inherit" /> : "Đăng Nhập"}
                      </Button>

                      {/* QUICK FILL DEMO ACCOUNTS */}
                      <Box sx={{ mt: 2, pt: 2, borderTop: "1px dashed #cbd5e1" }}>
                        <Typography variant="caption" fontWeight={600} color="text.secondary" display="block" mb={1}>
                          ⚡ ĐĂNG NHẬP NHANH (DEMO ACCOUNTS - MẬT KHẨU: User123!):
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                          <Chip
                            icon={<AdminPanelSettingsIcon />}
                            label="Master Admin"
                            onClick={() => {
                              setEmail("master@example.com");
                              setPassword("User123!");
                            }}
                            sx={{ bgcolor: "#fee2e2", color: "#b91c1c", fontWeight: 600, cursor: "pointer" }}
                          />
                          <Chip
                            icon={<ShieldIcon />}
                            label="Admin"
                            onClick={() => {
                              setEmail("admin@example.com");
                              setPassword("User123!");
                            }}
                            sx={{ bgcolor: "#e0e7ff", color: "#3730a3", fontWeight: 600, cursor: "pointer" }}
                          />
                          <Chip
                            icon={<PersonIcon />}
                            label="Demo User"
                            onClick={() => {
                              setEmail("user@example.com");
                              setPassword("User123!");
                            }}
                            sx={{ bgcolor: "#dcfce7", color: "#15803d", fontWeight: 600, cursor: "pointer" }}
                          />
                        </Stack>
                      </Box>
                    </Stack>
                  </Box>
                ) : (
                  /* TAB 2: ĐĂNG NHẬP GOOGLE SSO */
                  <Stack spacing={2.5}>
                    <Alert severity="info" sx={{ fontSize: "0.85rem" }}>
                      <strong>Tính năng SSO:</strong> Nếu tài khoản Google chưa từng tồn tại, hệ thống sẽ <strong>tự động tạo & đăng ký tài khoản mới vào Database</strong> ngay lập tức!
                    </Alert>

                    <TextField
                      label="Email Google"
                      type="email"
                      value={ssoEmail}
                      onChange={(e) => setSsoEmail(e.target.value)}
                      fullWidth
                    />
                    <TextField
                      label="Họ và Tên"
                      value={ssoName}
                      onChange={(e) => setSsoName(e.target.value)}
                      fullWidth
                    />

                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<GoogleIcon />}
                      disabled={loading}
                      onClick={() => handleSsoLogin(ssoEmail, ssoName, "USER")}
                      sx={{
                        bgcolor: "#ea4335",
                        "&:hover": { bgcolor: "#d93025" },
                        py: 1.2,
                        fontWeight: 600,
                      }}
                    >
                      {loading ? <CircularProgress size={24} color="inherit" /> : "Đăng Nhập / Đăng Ký bằng Google"}
                    </Button>

                    {/* MOCK SSO PROFILE BUTTONS */}
                    <Box sx={{ mt: 2, pt: 2, borderTop: "1px dashed #cbd5e1" }}>
                      <Typography variant="caption" fontWeight={600} color="text.secondary" display="block" mb={1}>
                        ⚡ MÔ PHỎNG ĐĂNG NHẬP 1-CHẠM BẰNG GOOGLE PROFILES:
                      </Typography>
                      <Stack spacing={1}>
                        <Button
                          variant="outlined"
                          size="small"
                          color="error"
                          startIcon={<GoogleIcon />}
                          onClick={() => handleSsoLogin("master.google@company.com", "Google Master Admin", "MASTER_ADMIN")}
                          sx={{ justifyContent: "flex-start" }}
                        >
                          Google Master: master.google@company.com (MASTER_ADMIN)
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          color="primary"
                          startIcon={<GoogleIcon />}
                          onClick={() => handleSsoLogin("admin.google@company.com", "Google Admin Pro", "ADMIN")}
                          sx={{ justifyContent: "flex-start" }}
                        >
                          Google Admin: admin.google@company.com (ADMIN)
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          color="success"
                          startIcon={<GoogleIcon />}
                          onClick={() => handleSsoLogin(`newbie.${Date.now().toString().slice(-4)}@gmail.com`, "Thành Viên Mới", "USER")}
                          sx={{ justifyContent: "flex-start" }}
                        >
                          Tạo tài khoản Google mới tinh (Tự động đăng ký vào DB)
                        </Button>
                      </Stack>
                    </Box>
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Box>
        ) : (
          /* NẾU ĐÃ ĐĂNG NHẬP: HIỂN THỊ TRANG DASHBOARD THEO ROLE */
          <Box sx={{ mt: 3 }}>
            {/* THANH ĐIỀU HƯỚNG TABS THEO ROLE */}
            <Paper sx={{ borderRadius: 3, mb: 3, overflow: "hidden" }}>
              <Tabs
                value={dashboardTab}
                onChange={(_, val) => setDashboardTab(val)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  bgcolor: "#fff",
                  "& .Mui-selected": { fontWeight: 700 },
                }}
              >
                <Tab icon={<PersonIcon />} iconPosition="start" label="1. Trang Cá Nhân (User)" />
                <Tab
                  icon={<ShieldIcon />}
                  iconPosition="start"
                  label={`2. Quản Trị Người Dùng (${user.role === "USER" ? "Bị Khóa" : "Admin"})`}
                />
                <Tab
                  icon={<AdminPanelSettingsIcon />}
                  iconPosition="start"
                  label={`3. Quản Trị Hệ Thống & Redis (${user.role === "MASTER_ADMIN" ? "Master" : "Bị Khóa"})`}
                />
                <Tab icon={<SecurityIcon />} iconPosition="start" label="4. Phòng Thử Nghiệm RBAC & Redis Ban" />
              </Tabs>
            </Paper>

            {/* NỘI DUNG TAB 1: THÔNG TIN CÁ NHÂN & JWT INSPECTOR */}
            {dashboardTab === 0 && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={5}>
                  <Card sx={{ borderRadius: 3, boxShadow: 2, height: "100%" }}>
                    <CardContent sx={{ p: 3 }}>
                      <Stack spacing={2.5} alignItems="center" textAlign="center">
                        <Avatar
                          src={user.avatar}
                          sx={{ width: 90, height: 90, border: "3px solid #0284c7" }}
                        />
                        <Box>
                          <Typography variant="h5" fontWeight={700}>
                            {user.name}
                          </Typography>
                          <Typography color="text.secondary">{user.email}</Typography>
                          <Chip
                            icon={ROLE_CONFIG[user.role]?.icon}
                            label={user.role}
                            sx={{
                              mt: 1,
                              bgcolor: ROLE_CONFIG[user.role]?.bgColor,
                              color: ROLE_CONFIG[user.role]?.color,
                              fontWeight: 700,
                            }}
                          />
                        </Box>
                      </Stack>

                      <Divider sx={{ my: 2.5 }} />

                      <Stack spacing={1.5}>
                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                          <Typography variant="body2" color="text.secondary">
                            Mã người dùng (User ID):
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {user.id}
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                          <Typography variant="body2" color="text.secondary">
                            Phương thức đăng nhập:
                          </Typography>
                          <Chip
                            label={user.provider === "google" ? "Google SSO" : "Mật khẩu Local"}
                            size="small"
                            color={user.provider === "google" ? "error" : "default"}
                          />
                        </Box>
                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                          <Typography variant="body2" color="text.secondary">
                            Mô tả quyền hạn:
                          </Typography>
                          <Typography variant="caption" fontWeight={600} color="primary" sx={{ maxWidth: 200, textAlign: "right" }}>
                            {ROLE_CONFIG[user.role]?.description}
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={7}>
                  <Card sx={{ borderRadius: 3, boxShadow: 2, height: "100%" }}>
                    <CardContent sx={{ p: 3 }}>
                      <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                        <KeyIcon color="primary" />
                        <Typography variant="h6" fontWeight={700}>
                          Mổ Xẻ JWT Access Token (JWT Inspector)
                        </Typography>
                      </Stack>

                      <Alert severity="info" sx={{ mb: 2, fontSize: "0.85rem" }}>
                        Token này được cấp kèm chữ ký HMAC-SHA256, thời hạn 15 phút, chứa <strong>JTI</strong> định danh duy nhất để phục vụ thu hồi qua Redis khi đăng xuất.
                      </Alert>

                      {tokenPayload && (
                        <Box
                          sx={{
                            bgcolor: "#0f172a",
                            color: "#38bdf8",
                            p: 2,
                            borderRadius: 2,
                            fontFamily: "monospace",
                            fontSize: "0.82rem",
                            overflowX: "auto",
                          }}
                        >
                          <pre style={{ margin: 0 }}>
                            {JSON.stringify(
                              {
                                header: { alg: "HS256", typ: "JWT" },
                                payload: tokenPayload,
                              },
                              null,
                              2
                            )}
                          </pre>
                        </Box>
                      )}

                      <Stack direction="row" spacing={1} sx={{ mt: 2 }} alignItems="center">
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => testApiEndpoint("Lấy Profile (/api/user/profile)", "/api/user/profile")}
                        >
                          Thử gọi API /api/user/profile
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}

            {/* NỘI DUNG TAB 2: QUẢN TRỊ NGƯỜI DÙNG (ADMIN & MASTER) */}
            {dashboardTab === 1 && (
              <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    <Box>
                      <Typography variant="h6" fontWeight={700}>
                        Quản Trị Người Dùng Trong Database
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Chỉ tài khoản ADMIN và MASTER_ADMIN mới có quyền truy cập
                      </Typography>
                    </Box>
                    <IconButton onClick={fetchUsers} disabled={refreshingData}>
                      <RefreshIcon />
                    </IconButton>
                  </Stack>

                  {user.role === "USER" ? (
                    <Alert severity="error">
                      <strong>Truy cập bị từ chối (403 Forbidden)!</strong> Vai trò hiện tại của bạn là <strong>USER</strong>. Bạn không có quyền xem hoặc quản lý danh sách người dùng.
                    </Alert>
                  ) : (
                    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                      <Table size="small">
                        <TableHead sx={{ bgcolor: "#f8fafc" }}>
                          <TableRow>
                            <TableCell><strong>Người dùng</strong></TableCell>
                            <TableCell><strong>Email</strong></TableCell>
                            <TableCell><strong>Vai trò (Role)</strong></TableCell>
                            <TableCell><strong>Nguồn (Provider)</strong></TableCell>
                            <TableCell><strong>Trạng thái</strong></TableCell>
                            <TableCell align="right"><strong>Hành động</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {usersList.map((u) => (
                            <TableRow key={u.id} hover>
                              <TableCell>
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <Avatar src={u.avatar} sx={{ width: 28, height: 28 }} />
                                  <Typography variant="body2" fontWeight={600}>
                                    {u.name}
                                  </Typography>
                                </Stack>
                              </TableCell>
                              <TableCell>{u.email}</TableCell>
                              <TableCell>
                                <Chip
                                  label={u.role}
                                  size="small"
                                  sx={{
                                    bgcolor: ROLE_CONFIG[u.role]?.bgColor,
                                    color: ROLE_CONFIG[u.role]?.color,
                                    fontWeight: 700,
                                  }}
                                />
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={u.provider}
                                  size="small"
                                  variant="outlined"
                                  color={u.provider === "google" ? "error" : "default"}
                                />
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={u.active ? "Đang hoạt động" : "Đã bị khóa"}
                                  size="small"
                                  color={u.active ? "success" : "default"}
                                />
                              </TableCell>
                              <TableCell align="right">
                                {u.role !== "MASTER_ADMIN" && (
                                  <Button
                                    size="small"
                                    color={u.active ? "error" : "success"}
                                    onClick={() => handleToggleStatus(u.id)}
                                  >
                                    {u.active ? "Khóa" : "Kích hoạt"}
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </CardContent>
              </Card>
            )}

            {/* NỘI DUNG TAB 3: MASTER ADMIN & REDIS BLACKLIST */}
            {dashboardTab === 2 && (
              <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    <Box>
                      <Typography variant="h6" fontWeight={700}>
                        Quản Trị Hệ Thống Tối Cao & Giám Sát Redis
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Đặc quyền của MASTER_ADMIN: Giám sát Token bị ban trong Redis và thay đổi vai trò người dùng
                      </Typography>
                    </Box>
                    <IconButton onClick={fetchBlacklist} disabled={refreshingData}>
                      <RefreshIcon />
                    </IconButton>
                  </Stack>

                  {user.role !== "MASTER_ADMIN" ? (
                    <Alert severity="error">
                      <strong>Truy cập bị từ chối (403 Forbidden)!</strong> Trang này chỉ dành riêng cho <strong>MASTER_ADMIN</strong>.
                    </Alert>
                  ) : (
                    <Stack spacing={3}>
                      {/* REDIS CONNECTION STATUS */}
                      <Alert severity={redisInfo?.connected ? "success" : "warning"}>
                        <strong>Trạng thái Redis:</strong> {redisInfo?.connected ? "Đang kết nối Redis Server thật tại " + redisInfo.redisUrl : "Đang chạy chế độ In-Memory Fallback (Vẫn đảm bảo ban token chính xác theo TTL)"}.
                      </Alert>

                      {/* DANH SÁCH REDIS BLACKLISTED TOKENS */}
                      <Box>
                        <Typography variant="subtitle1" fontWeight={700} mb={1}>
                          Danh Sách Token Đang Bị Thu Hồi Trong Redis (Blacklist):
                        </Typography>
                        {blacklistedTokens.length === 0 ? (
                          <Paper sx={{ p: 3, textAlign: "center", bgcolor: "#f8fafc", borderRadius: 2 }}>
                            <Typography color="text.secondary">
                              Chưa có token nào bị blacklist. Khi người dùng bấm Đăng xuất (Logout), token sẽ lập tức xuất hiện tại đây!
                            </Typography>
                          </Paper>
                        ) : (
                          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                            <Table size="small">
                              <TableHead sx={{ bgcolor: "#fee2e2" }}>
                                <TableRow>
                                  <TableCell><strong>JTI / Token Key</strong></TableCell>
                                  <TableCell><strong>Email</strong></TableCell>
                                  <TableCell><strong>Role</strong></TableCell>
                                  <TableCell><strong>Thời điểm bị Ban</strong></TableCell>
                                  <TableCell><strong>TTL Còn Lại</strong></TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {blacklistedTokens.map((t, idx) => (
                                  <TableRow key={idx}>
                                    <TableCell sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}>
                                      {t.key}
                                    </TableCell>
                                    <TableCell>{t.email}</TableCell>
                                    <TableCell>
                                      <Chip label={t.role} size="small" />
                                    </TableCell>
                                    <TableCell>{new Date(t.bannedAt).toLocaleTimeString()}</TableCell>
                                    <TableCell>
                                      <Chip
                                        label={`${t.remainingSeconds}s`}
                                        size="small"
                                        color="error"
                                        variant="outlined"
                                      />
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        )}
                      </Box>

                      {/* NÂNG / HẠ CẤP VAI TRÒ NGƯỜI DÙNG */}
                      <Box>
                        <Typography variant="subtitle1" fontWeight={700} mb={1}>
                          Cấp Quyền / Đổi Vai Trò Người Dùng (RBAC):
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                          {usersList.map((u) => (
                            <Chip
                              key={u.id}
                              label={`${u.name} (${u.role})`}
                              onClick={() => {
                                const nextRole =
                                  u.role === "USER" ? "ADMIN" : u.role === "ADMIN" ? "MASTER_ADMIN" : "USER";
                                handleUpdateRole(u.id, nextRole);
                              }}
                              color="primary"
                              variant="outlined"
                              sx={{ cursor: "pointer" }}
                            />
                          ))}
                        </Stack>
                      </Box>
                    </Stack>
                  )}
                </CardContent>
              </Card>
            )}

            {/* NỘI DUNG TAB 4: PHÒNG THỬ NGHIỆM RBAC & REDIS BAN */}
            {dashboardTab === 3 && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card sx={{ borderRadius: 3, boxShadow: 2, height: "100%" }}>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" fontWeight={700} mb={1}>
                        🧪 Thử Nghiệm Quyền Hạn (RBAC API Tester)
                      </Typography>
                      <Typography variant="body2" color="text.secondary" mb={2}>
                        Bấm vào từng nút bên dưới để kiểm tra phản hồi từ Server đối với tài khoản <strong>{user.role}</strong> hiện tại:
                      </Typography>

                      <Stack spacing={1.5}>
                        <Button
                          variant="outlined"
                          color="success"
                          fullWidth
                          onClick={() => testApiEndpoint("User API (/api/user/profile)", "/api/user/profile")}
                        >
                          1. Gọi User API (/api/user/profile) - (Cho phép: USER, ADMIN, MASTER)
                        </Button>

                        <Button
                          variant="outlined"
                          color="primary"
                          fullWidth
                          onClick={() => testApiEndpoint("Admin API (/api/admin/dashboard)", "/api/admin/dashboard")}
                        >
                          2. Gọi Admin API (/api/admin/dashboard) - (Cho phép: ADMIN, MASTER)
                        </Button>

                        <Button
                          variant="outlined"
                          color="error"
                          fullWidth
                          onClick={() => testApiEndpoint("Master API (/api/admin/master)", "/api/admin/master")}
                        >
                          3. Gọi Master API (/api/admin/master) - (Cho phép: CHỈ MASTER_ADMIN)
                        </Button>
                      </Stack>

                      <Divider sx={{ my: 3 }} />

                      <Typography variant="subtitle1" fontWeight={700} mb={1} color="error">
                        🚫 Thử Nghiệm Thu Hồi Token Qua Redis (Logout Ban Test)
                      </Typography>
                      <Typography variant="body2" color="text.secondary" mb={2}>
                        Chứng minh Access Token bị vô hiệu hóa ngay sau khi Đăng xuất:
                      </Typography>

                      <Stack spacing={1.5}>
                        <Button
                          variant="contained"
                          color="warning"
                          onClick={() => {
                            setSavedOldToken(token);
                            setAuthSuccess("Đã lưu bản sao của Token hiện tại vào bộ nhớ thử nghiệm!");
                          }}
                        >
                          Bước 1: Lưu bản sao Token hiện tại
                        </Button>

                        <Button
                          variant="contained"
                          color="error"
                          disabled={!savedOldToken}
                          onClick={() => {
                            testApiEndpoint("Thử gọi API bằng Token ĐÃ BỊ BAN", "/api/user/profile", savedOldToken);
                          }}
                        >
                          Bước 2: Thử gọi API bằng Token đã lưu (Kỳ vọng: 401 Banned by Redis)
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card sx={{ borderRadius: 3, boxShadow: 2, height: "100%" }}>
                    <CardContent sx={{ p: 3 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="h6" fontWeight={700}>
                          📋 Nhật Ký Kết Quả API Call (Console)
                        </Typography>
                        <Button size="small" onClick={() => setApiLogs([])}>
                          Xóa log
                        </Button>
                      </Stack>

                      <Box
                        sx={{
                          bgcolor: "#0f172a",
                          color: "#f8fafc",
                          p: 2,
                          borderRadius: 2,
                          height: 380,
                          overflowY: "auto",
                          fontFamily: "monospace",
                          fontSize: "0.8rem",
                        }}
                      >
                        {apiLogs.length === 0 ? (
                          <Typography color="#64748b" variant="body2">
                            Chưa có API log nào. Hãy bấm các nút bên trái để thử nghiệm!
                          </Typography>
                        ) : (
                          apiLogs.map((log) => (
                            <Box
                              key={log.id}
                              sx={{
                                mb: 1.5,
                                pb: 1.5,
                                borderBottom: "1px dashed #334155",
                              }}
                            >
                              <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Typography
                                  variant="caption"
                                  fontWeight={700}
                                  sx={{
                                    color:
                                      log.status === 200
                                        ? "#4ade80"
                                        : log.status === 403
                                        ? "#facc15"
                                        : "#f87171",
                                  }}
                                >
                                  [{log.status}] {log.endpoint}
                                </Typography>
                                <Typography variant="caption" color="#94a3b8">
                                  {log.timestamp} ({log.duration})
                                </Typography>
                              </Stack>
                              <pre style={{ margin: "4px 0 0 0", color: "#93c5fd" }}>
                                {JSON.stringify(log.data, null, 2)}
                              </pre>
                            </Box>
                          ))
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}
          </Box>
        )}
      </Container>
    </Box>
  );
}
