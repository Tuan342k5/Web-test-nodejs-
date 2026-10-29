import "./config/env.js";
import app from "./app.js";

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

// Xử lý tắt server an toàn (Graceful Shutdown)
const handleShutdown = (signal) => {
  console.log(`\nNhận tín hiệu ${signal}. Đang đóng HTTP Server an toàn...`);
  server.close(() => {
    console.log("HTTP server đã đóng thành công.");
    process.exit(0);
  });
};

process.on("SIGINT", () => handleShutdown("SIGINT"));
process.on("SIGTERM", () => handleShutdown("SIGTERM"));

export default server;

