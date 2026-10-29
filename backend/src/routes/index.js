import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import userRoutes from "../modules/users/user.routes.js";
import adminRoutes from "../modules/admin/admin.routes.js";

const router = Router();

// Health check endpoint
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Auth RBAC Backend Enterprise is running smoothly",
    timestamp: new Date().toISOString(),
  });
});

// Gắn các module routes
router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/admin", adminRoutes);

export default router;

