import React from "react";
import { Box, Button, Card, CardContent, Stack, Typography } from "@mui/material";
import BlockIcon from "@mui/icons-material/Block";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { getDefaultRouteForRole } from "../../constants/routes.js";

export default function ForbiddenPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleBack = () => {
    if (user) {
      navigate(getDefaultRouteForRole(user.role));
    } else {
      navigate("/login");
    }
  };

  return (
    <Card sx={{ maxWidth: 480, mx: "auto", textAlign: "center", borderRadius: 4, p: 3, boxShadow: 3 }}>
      <CardContent>
        <Stack spacing={3} alignItems="center">
          <Box sx={{ bgcolor: "#fee2e2", p: 2, borderRadius: "50%", display: "inline-flex" }}>
            <BlockIcon sx={{ fontSize: 64, color: "#dc2626" }} />
          </Box>

          <Typography variant="h4" fontWeight={800} color="#b91c1c">
            403 - Cấm Truy Cập
          </Typography>

          <Typography variant="body1" color="text.secondary">
            Bạn không có đủ quyền để truy cập vào tài nguyên này. Vui lòng liên hệ Quản trị viên nếu bạn nghĩ đây là sự nhầm lẫn.
          </Typography>

          <Button
            variant="contained"
            color="primary"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
            sx={{ px: 4, py: 1, borderRadius: 2 }}
          >
            Quay Về Trang Chủ Của Bạn
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

