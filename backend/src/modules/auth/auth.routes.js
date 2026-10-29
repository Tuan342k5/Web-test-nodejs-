import { Router } from "express";
import {
  login,
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

router.post("/login", validate(validateLogin), login);
router.post("/sso/google", validate(validateSSO), ssoGoogleLogin);
router.post("/logout", logout);

// Me endpoint hỗ trợ cả getCurrentUser đầy đủ
router.get("/me", authenticate, getCurrentUser);
router.get("/redis-status", getRedisStatusController);

export default router;

