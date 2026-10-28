import "./config/env.js";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// API kiểm tra trạng thái server.
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Auth RBAC Backend is running",
  });
});

// Tất cả endpoint xác thực được đặt dưới /api/auth.
app.use("/api/auth", authRoutes);

// Route không tồn tại.
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint không tồn tại.",
  });
});

// Error-handling middleware: phải đặt sau các route.
app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  const statusCode = error.statusCode || 500;

  if (statusCode >= 500) {
    console.error(error);
  }

  return res.status(statusCode).json({
    success: false,
    message:
      statusCode >= 500
        ? "Đã xảy ra lỗi phía máy chủ."
        : error.message,
  });
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
