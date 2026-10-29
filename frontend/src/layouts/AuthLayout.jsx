import React from "react";
import { Outlet } from "react-router-dom";
import { Box, Container } from "@mui/material";

export default function AuthLayout() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#f1f5f9",
        py: 4,
      }}
    >
      <Container maxWidth="xs">
        <Outlet />
      </Container>
    </Box>
  );
}

