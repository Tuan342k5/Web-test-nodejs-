import { Router } from "express";
import {
  getDashboardStats,
  getMasterStatus,
  getSystemStatus,
  getRedisBlacklist,
} from "./admin.controller.js";
import {
  getAllUsers,
  toggleUserStatus,
  updateUserRole,
} from "../users/user.controller.js";
import { authenticate } from "../../middlewares/authenticate.js";
import { authorize } from "../../middlewares/authorize.js";
import { validate } from "../../middlewares/validate.js";
import { validateUpdateRole } from "../users/user.validation.js";
import { ROLES } from "../../constants/roles.js";

const router = Router();

// Yêu cầu xác thực toàn bộ route admin
router.use(authenticate);

// ==========================================
// 1. DÀNH CHO ADMIN & MASTER_ADMIN
// ==========================================
router.get("/dashboard", authorize(ROLES.MASTER_ADMIN, ROLES.ADMIN), getDashboardStats);
router.get("/users", authorize(ROLES.MASTER_ADMIN, ROLES.ADMIN), getAllUsers);
router.patch("/users/:id/status", authorize(ROLES.MASTER_ADMIN, ROLES.ADMIN), toggleUserStatus);

// ==========================================
// 2. DÀNH RIÊNG CHO MASTER_ADMIN
// ==========================================
router.get("/master", authorize(ROLES.MASTER_ADMIN), getMasterStatus);
router.get("/master/system-status", authorize(ROLES.MASTER_ADMIN), getSystemStatus);
router.get("/master/blacklist", authorize(ROLES.MASTER_ADMIN), getRedisBlacklist);
router.patch(
  "/master/users/:id/role",
  authorize(ROLES.MASTER_ADMIN),
  validate(validateUpdateRole),
  updateUserRole
);

export default router;

