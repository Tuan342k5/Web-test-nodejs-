import "./config/env.js";
import express from "express";
import cors from "cors";
import { corsOptions } from "./config/cors.js";
import rootRoutes from "./routes/index.js";
import { rateLimiter } from "./middlewares/rateLimiter.js";
import { notFound } from "./middlewares/notFound.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();

// Middlewares toàn cục
app.use(cors(corsOptions));
app.use(express.json());
app.use(rateLimiter(200, 60 * 1000)); // 200 requests/phút

// Gắn các API routes dưới /api
app.use("/api", rootRoutes);

// Root route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Auth RBAC Enterprise Backend API",
    documentation: "/api/health",
  });
});

// Middleware xử lý 404
app.use(notFound);

// Middleware xử lý lỗi tập trung
app.use(errorHandler);

export default app;
