import { Router } from "express";
import {
  login,
  logout,
  ssoGoogleLogin,
  getRedisInfo,
} from "../controllers/auth.controller.js";
import { getCurrentUser } from "../controllers/user.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = Router();

// Endpoint đăng nhập thường & SSO
router.post("/login", login);
router.post("/sso/google", ssoGoogleLogin);

// Endpoint đăng xuất (Blacklist token vào Redis)
router.post("/logout", logout);

// Endpoint lấy thông tin tài khoản hiện tại
router.get("/me", authenticateToken, getCurrentUser);

// Endpoint kiểm tra trạng thái Redis
router.get("/redis-status", getRedisInfo);

export default router;
