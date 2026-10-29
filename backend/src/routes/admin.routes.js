import { Router } from "express";
import {
  authenticateToken,
  authorizeRoles,
} from "../middlewares/auth.middleware.js";
import {
  getAllUsers,
  toggleUserStatus,
  updateUserRole,
  getRedisBlacklist,
} from "../controllers/user.controller.js";
import { getRedisStatus } from "../services/redis.service.js";

const router = Router();

// Tất cả các route trong file này đều yêu cầu đăng nhập trước
router.use(authenticateToken);

// ==========================================
// 1. DÀNH CHO ADMIN & MASTER_ADMIN
// ==========================================
router.get(
  "/dashboard",
  authorizeRoles("MASTER_ADMIN", "ADMIN"),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Bạn có quyền truy cập trang quản trị.",
      data: {
        userId: req.auth.id,
        role: req.auth.role,
        adminAccessGrantedAt: new Date().toISOString(),
      },
    });
  }
);

// Lấy danh sách người dùng trong hệ thống
router.get(
  "/users",
  authorizeRoles("MASTER_ADMIN", "ADMIN"),
  getAllUsers
);

// Khóa hoặc mở khóa người dùng
router.patch(
  "/users/:id/status",
  authorizeRoles("MASTER_ADMIN", "ADMIN"),
  toggleUserStatus
);

// ==========================================
// 2. DÀNH RIÊNG CHO MASTER_ADMIN
// ==========================================
router.get(
  "/master",
  authorizeRoles("MASTER_ADMIN"),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Bạn có quyền MASTER_ADMIN tối cao.",
      data: {
        userId: req.auth.id,
        role: req.auth.role,
      },
    });
  }
);

// Trạng thái hệ thống & Redis Monitor
router.get(
  "/master/system-status",
  authorizeRoles("MASTER_ADMIN"),
  (req, res) => {
    res.status(200).json({
      success: true,
      data: {
        system: {
          nodeVersion: process.version,
          uptimeSeconds: Math.floor(process.uptime()),
          memoryUsageMb: Math.round(process.memoryUsage().rss / (1024 * 1024)),
          platform: process.platform,
        },
        redis: getRedisStatus(),
      },
    });
  }
);

// Xem danh sách các Token đang bị Ban trong Redis
router.get(
  "/master/blacklist",
  authorizeRoles("MASTER_ADMIN"),
  getRedisBlacklist
);

// Đổi role cho người dùng
router.patch(
  "/master/users/:id/role",
  authorizeRoles("MASTER_ADMIN"),
  updateUserRole
);

export default router;
