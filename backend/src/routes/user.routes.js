import { Router } from "express";
import { getCurrentUser } from "../controllers/user.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = Router();

// Tất cả người dùng có token hợp lệ (USER, ADMIN, MASTER_ADMIN) đều được truy cập
router.use(authenticateToken);

router.get("/profile", getCurrentUser);

export default router;

