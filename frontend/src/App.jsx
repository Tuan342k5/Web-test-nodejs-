
import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

const API_URL = "http://localhost:3000";

function App() {
  const [email, setEmail] = useState("user@example.com");
  const [password, setPassword] = useState("User123!");
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setUser(null);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Đăng nhập thất bại.");
      }

      setUser(result.data.user);
    } catch (err) {
      setError(
        err.message || "Không thể kết nối đến Backend."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    // Chỉ xóa trạng thái giao diện ở bước này.
    // Chưa phải logout bảo mật vì chưa có session/token.
    setUser(null);
    setError("");
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f7fb", py: 8 }}>
      <Container maxWidth="sm">
        <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Stack spacing={3}>
              <Box>
                <Chip label="STEP 3 · AUTH API" color="primary" />
                <Typography variant="h4" fontWeight={700} sx={{ mt: 2 }}>
                  Auth RBAC Demo
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 1 }}>
                  ReactJS + MUI · Node.js + Express
                </Typography>
              </Box>

              {user ? (
                <>
                  <Alert severity="success">
                    Đăng nhập thành công!
                  </Alert>

                  <Typography variant="h6">
                    Xin chào, {user.name}
                  </Typography>

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Email
                    </Typography>
                    <Typography>{user.email}</Typography>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Role
                    </Typography>
                    <Chip label={user.role} color="primary" sx={{ mt: 1 }} />
                  </Box>

                  <Button
                    variant="outlined"
                    color="error"
                    onClick={handleLogout}
                  >
                    Logout demo
                  </Button>

                  <Typography variant="caption" color="text.secondary">
                    Đây mới là logout giao diện, chưa thu hồi token trên Backend.
                  </Typography>
                </>
              ) : (
                <Box component="form" onSubmit={handleLogin}>
                  <Stack spacing={2.5}>
                    <TextField
                      label="Email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
                      fullWidth
                    />

                    <TextField
                      label="Password"
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                      fullWidth
                    />

                    {error && <Alert severity="error">{error}</Alert>}

                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={loading}
                    >
                      {loading ? "Đang đăng nhập..." : "Login"}
                    </Button>
                  </Stack>
                </Box>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

export default App;
