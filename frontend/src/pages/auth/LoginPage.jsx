import React, { useState, useEffect } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import GoogleIcon from "@mui/icons-material/Google";
import SecurityIcon from "@mui/icons-material/Security";
import LaunchIcon from "@mui/icons-material/Launch";
import { useNavigate, Navigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { getDefaultRouteForRole } from "../../constants/routes.js";
import { API_BASE_URL } from "../../config/env.js";

export default function LoginPage() {
  const { user, isAuthenticated, login, loginGoogleSSO } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [tab, setTab] = useState(0); // 0: Password, 1: Google SSO
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [ssoEmail, setSsoEmail] = useState("");
  const [ssoName, setSsoName] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Hiển thị lỗi nếu được chuyển hướng về từ Google SSO Callback
  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
      setTab(1);
    }
  }, [searchParams]);

  // Nếu người dùng đã đăng nhập đầy đủ, điều hướng tới trang tương ứng vai trò
  if (isAuthenticated && user) {
    return <Navigate to={getDefaultRouteForRole(user.role)} replace />;
  }

  // Khởi động luồng Google OAuth 2.0 chính thức (chuyển hướng sang Google Accounts)
  function handleDirectGoogleOAuth() {
    setLoading(true);
    window.location.href = `${API_BASE_URL}/api/auth/google`;
  }

  // Đăng nhập mật khẩu chuẩn
  async function handlePasswordLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const loggedUser = await login(email, password);
      navigate(getDefaultRouteForRole(loggedUser.role));
    } catch (err) {
      setError(err.message || "Đăng nhập thất bại.");
    } finally {
      setLoading(false);
    }
  }

  // Đăng nhập Google SSO qua email / credential trực tiếp
  async function handleGoogleLogin(e) {
    e.preventDefault();
    if (!ssoEmail.trim()) {
      setError("Vui lòng nhập email Google.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const loggedUser = await loginGoogleSSO({
        email: ssoEmail.trim(),
        name: ssoName.trim() || ssoEmail.split("@")[0],
      });
      // Đăng nhập Google thành công chuyển hướng đúng vai trò hiện tại
      navigate(getDefaultRouteForRole(loggedUser.role));
    } catch (err) {
      setError(err.message || "Đăng nhập Google SSO thất bại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card sx={{ borderRadius: 4, boxShadow: 3, overflow: "hidden" }}>
      <Box sx={{ bgcolor: "#0f172a", color: "#fff", p: 3, textAlign: "center" }}>
        <SecurityIcon sx={{ fontSize: 36, color: "#38bdf8", mb: 0.5 }} />
        <Typography variant="h6" fontWeight={700}>
          Đăng Nhập Hệ Thống
        </Typography>
        <Typography variant="caption" sx={{ color: "#94a3b8" }}>
          Hỗ trợ xác thực RBAC & Đăng nhập một lần (Google SSO)
        </Typography>
      </Box>

      <Tabs
        value={tab}
        onChange={(_, val) => {
          setTab(val);
          setError("");
        }}
        variant="fullWidth"
        sx={{ borderBottom: 1, borderColor: "divider" }}
      >
        <Tab icon={<LockIcon fontSize="small" />} iconPosition="start" label="Mật khẩu" />
        <Tab icon={<GoogleIcon fontSize="small" />} iconPosition="start" label="Google SSO" />
      </Tabs>

      <CardContent sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2.5 }}>
            {error}
          </Alert>
        )}

        {/* Tab 0: Mật khẩu */}
        {tab === 0 && (
          <Box component="form" onSubmit={handlePasswordLogin}>
            <Stack spacing={2}>
              <TextField
                label="Email"
                type="email"
                fullWidth
                size="small"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vd: user@example.com"
              />
              <TextField
                label="Mật khẩu"
                type="password"
                fullWidth
                size="small"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={loading}
                sx={{
                  bgcolor: "#0284c7",
                  "&:hover": { bgcolor: "#0369a1" },
                  py: 1.2,
                  fontWeight: 600,
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Đăng Nhập"}
              </Button>
            </Stack>
          </Box>
        )}

        {/* Tab 1: Google SSO */}
        {tab === 1 && (
          <Stack spacing={2.5}>
            {/* Nút bấm Google OAuth 2.0 chính thức */}
            <Button
              variant="contained"
              fullWidth
              size="large"
              color="error"
              startIcon={<GoogleIcon />}
              endIcon={<LaunchIcon sx={{ fontSize: "1rem !important" }} />}
              onClick={handleDirectGoogleOAuth}
              disabled={loading}
              sx={{
                py: 1.4,
                fontWeight: 700,
                fontSize: "0.95rem",
                textTransform: "none",
                borderRadius: 2,
                boxShadow: 2,
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Đăng nhập với Google"}
            </Button>

            <Typography variant="caption" sx={{ color: "text.secondary", textAlign: "center" }}>
              Hệ thống sẽ chuyển hướng an toàn tới Google để chọn tài khoản và cấp quyền.
            </Typography>

            <Divider>
              <Typography variant="caption" color="text.secondary">
                HOẶC NHẬP NHANH
              </Typography>
            </Divider>

            {/* Form nhập nhanh tiện lợi cho môi trường kiểm thử */}
            <Box component="form" onSubmit={handleGoogleLogin}>
              <Stack spacing={1.5}>
                <TextField
                  label="Email Google"
                  type="email"
                  fullWidth
                  size="small"
                  required
                  value={ssoEmail}
                  onChange={(e) => setSsoEmail(e.target.value)}
                  placeholder="vd: yourname@gmail.com"
                />
                <TextField
                  label="Họ và tên (Tùy chọn)"
                  fullWidth
                  size="small"
                  value={ssoName}
                  onChange={(e) => setSsoName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                />
                <Button
                  type="submit"
                  variant="outlined"
                  fullWidth
                  size="medium"
                  color="inherit"
                  disabled={loading}
                  sx={{ py: 0.9, fontWeight: 600, textTransform: "none" }}
                >
                  Đăng Nhập Nhanh Không Chuyển Trang
                </Button>
              </Stack>
            </Box>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
