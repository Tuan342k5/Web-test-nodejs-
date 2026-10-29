import "./config/env.js";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import userRoutes from "./routes/user.routes.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// API kiểm tra trạng thái server
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Auth RBAC Backend is running",
  });
});

// Định tuyến các nhóm API
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);

// Route không tồn tại
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint không tồn tại.",
  });
});

// Error-handling middleware
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
