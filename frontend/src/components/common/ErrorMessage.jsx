import React from "react";
import { Alert, AlertTitle, Box, Button } from "@mui/material";

export default function ErrorMessage({
  title = "Đã xảy ra lỗi",
  message,
  onRetry,
  severity = "error",
}) {
  if (!message) return null;

  return (
    <Box sx={{ my: 2 }}>
      <Alert
        severity={severity}
        action={
          onRetry && (
            <Button color="inherit" size="small" onClick={onRetry}>
              Thử lại
            </Button>
          )
        }
      >
        {title && <AlertTitle>{title}</AlertTitle>}
        {message}
      </Alert>
    </Box>
  );
}

