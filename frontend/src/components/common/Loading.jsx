import React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";

export default function Loading({ message = "Đang tải dữ liệu..." }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "60vh",
        gap: 2,
      }}
    >
      <CircularProgress size={42} thickness={4} />
      {message && (
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      )}
    </Box>
  );
}

