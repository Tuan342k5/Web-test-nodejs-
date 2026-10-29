import React from "react";
import { Box, Button, Card, CardContent, Stack, Typography } from "@mui/material";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import HomeIcon from "@mui/icons-material/Home";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { getDefaultRouteForRole, ROUTES } from "../constants/routes.js";

export default function NotFoundPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleHome = () => {
    if (user) {
      navigate(getDefaultRouteForRole(user.role));
    } else {
      navigate(ROUTES.LOGIN);
    }
  };

  return (
    <Card sx={{ maxWidth: 480, mx: "auto", textAlign: "center", borderRadius: 4, p: 3, boxShadow: 3 }}>
      <CardContent>
        <Stack spacing={3} alignItems="center">
          <Box sx={{ bgcolor: "#f1f5f9", p: 2, borderRadius: "50%", display: "inline-flex" }}>
            <SearchOffIcon sx={{ fontSize: 64, color: "#64748b" }} />
          </Box>

          <Typography variant="h4" fontWeight={800} color="#334155">
            404 - Không Tìm Thấy
          </Typography>

          <Typography variant="body1" color="text.secondary">
            Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển sang địa chỉ khác.
          </Typography>

          <Button
            variant="contained"
            color="primary"
            startIcon={<HomeIcon />}
            onClick={handleHome}
            sx={{ px: 4, py: 1, borderRadius: 2 }}
          >
            Quay Về Trang Chủ
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

