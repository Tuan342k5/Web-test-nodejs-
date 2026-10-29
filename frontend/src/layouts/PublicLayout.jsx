import React from "react";
import { Outlet } from "react-router-dom";
import { Box, Container } from "@mui/material";

export default function PublicLayout() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#f8fafc",
      }}
    >
      <Container
        maxWidth="lg"
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          py: 4,
        }}
      >
        <Outlet />
      </Container>
    </Box>
  );
}

