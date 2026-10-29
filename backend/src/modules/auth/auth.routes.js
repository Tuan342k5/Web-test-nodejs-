import { Router } from "express";
import {
  login,
  redirectToGoogle,
  handleGoogleCallbackController,
  ssoGoogleLogin,
  logout,
  getMe,
  getRedisStatusController,
} from "./auth.controller.js";
import { getCurrentUser } from "../users/user.controller.js";
import { authenticate } from "../../middlewares/authenticate.js";
import { validate } from "../../middlewares/validate.js";
import { validateLogin, validateSSO } from "./auth.validation.js";

const router = Router();

// ==========================================
// 1. Google OAuth 2.0 (SSO) Flow Endpoints
// ==========================================
// Khởi chạy quá trình đăng nhập Google SSO
router.get("/google", redirectToGoogle);

// Endpoint Google điều hướng về sau khi người dùng đồng ý đăng nhập (GOOGLE_CALLBACK_URL)
router.get("/google/callback", handleGoogleCallbackController);

// ==========================================
// 2. Local & Direct SSO Endpoints
// ==========================================
router.post("/login", validate(validateLogin), login);
router.post("/sso/google", validate(validateSSO), ssoGoogleLogin);
router.post("/logout", logout);

// ==========================================
// 3. User Session & Redis Status
// ==========================================
router.get("/me", authenticate, getCurrentUser);
router.get("/redis-status", getRedisStatusController);

export default router;
