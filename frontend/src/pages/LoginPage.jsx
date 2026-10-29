import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
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
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate, Navigate } from "react-router-dom";

export default function LoginPage() {
  const { user, login, loginGoogleSSO } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState(0); // 0: Password, 1: Google SSO
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [ssoEmail, setSsoEmail] = useState("");
  const [ssoName, setSsoName] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Nếu người dùng đã đăng nhập sẵn, điều hướng tới trang tương ứng vai trò
  if (user) {
    if (user.role === "MASTER_ADMIN") return <Navigate to="/master-admin" replace />;
    if (user.role === "ADMIN") return <Navigate to="/admin" replace />;
    return <Navigate to="/user" replace />;
  }

  // Chuyển hướng URL dựa trên vai trò sau khi đăng nhập thành công
  function redirectByRole(userRole) {
    if (userRole === "MASTER_ADMIN") {
      navigate("/master-admin");
    } else if (userRole === "ADMIN") {
      navigate("/admin");
    } else {
      navigate("/user");
    }
  }

  // Đăng nhập mật khẩu chuẩn
  async function handlePasswordLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const loggedUser = await login(email, password);
      redirectByRole(loggedUser.role);
    } catch (err) {
      setError(err.message || "Đăng nhập thất bại.");
    } finally {
      setLoading(false);
    }
  }

  // Đăng nhập Google SSO
  async function handleGoogleLogin(e) {
    e.preventDefault();
    if (!ssoEmail.trim()) {
      setError("Vui lòng nhập email Google.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const loggedUser = await loginGoogleSSO(ssoEmail.trim(), ssoName.trim() || ssoEmail.split("@")[0]);
      redirectByRole(loggedUser.role);
    } catch (err) {
      setError(err.message || "Đăng nhập Google SSO thất bại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc", display: "flex", alignItems: "center", py: 6 }}>
      <Container maxWidth="xs">
        <Card sx={{ borderRadius: 4, boxShadow: 3, overflow: "hidden" }}>
          <Box sx={{ bgcolor: "#0f172a", color: "#fff", p: 3, textAlign: "center" }}>
            <SecurityIcon sx={{ fontSize: 36, color: "#38bdf8", mb: 0.5 }} />
            <Typography variant="h6" fontWeight={700}>
              Đăng Nhập Hệ Thống
            </Typography>
            <Typography variant="caption" sx={{ color: "#94a3b8" }}>
              Tự động điều hướng theo quyền (USER / ADMIN / MASTER_ADMIN)
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
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {tab === 0 ? (
              /* FORM ĐĂNG NHẬP MẬT KHẨU */
              <Box component="form" onSubmit={handlePasswordLogin}>
                <Stack spacing={2.5}>
                  <TextField
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    fullWidth
                    size="small"
                  />
                  <TextField
                    label="Mật khẩu"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    fullWidth
                    size="small"
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{ bgcolor: "#0284c7", "&:hover": { bgcolor: "#0369a1" }, py: 1, fontWeight: 700 }}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : "Đăng Nhập"}
                  </Button>
                </Stack>
              </Box>
            ) : (
              /* FORM ĐĂNG NHẬP GOOGLE SSO */
              <Box component="form" onSubmit={handleGoogleLogin}>
                <Stack spacing={2}>
                  <TextField
                    label="Email Google"
                    type="email"
                    value={ssoEmail}
                    onChange={(e) => setSsoEmail(e.target.value)}
                    required
                    fullWidth
                    size="small"
                  />
                  <TextField
                    label="Tên hiển thị (Tùy chọn)"
                    value={ssoName}
                    onChange={(e) => setSsoName(e.target.value)}
                    fullWidth
                    size="small"
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    startIcon={<GoogleIcon />}
                    disabled={loading}
                    sx={{ bgcolor: "#ea4335", "&:hover": { bgcolor: "#d93025" }, py: 1, fontWeight: 700 }}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : "Đăng Nhập bằng Google SSO"}
                  </Button>
                </Stack>
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

