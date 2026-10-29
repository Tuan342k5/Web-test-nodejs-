import * as authService from "./auth.service.js";
import { getBlacklistStatus } from "../../security/tokenBlacklist.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

/**
 * Đăng nhập Email & Mật khẩu
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);

  res.status(200).json({
    success: true,
    message: "Đăng nhập thành công.",
    data: result,
  });
});

/**
 * Đăng nhập Google SSO
 */
export const ssoGoogleLogin = asyncHandler(async (req, res) => {
  const result = await authService.loginWithSSO(req.body);

  const actionText = result.isNewAccount
    ? "Đăng ký và đăng nhập tài khoản Google SSO mới thành công!"
    : "Đăng nhập Google SSO thành công.";

  res.status(200).json({
    success: true,
    message: actionText,
    data: result,
  });
});

/**
 * Đăng xuất và thu hồi Token vào Redis Blacklist
 */
export const logout = asyncHandler(async (req, res) => {
  const authHeader = req.headers.authorization;
  const result = await authService.logout(authHeader, req.auth);

  res.status(200).json({
    success: true,
    message: "Đăng xuất thành công. Token đã được thu hồi và đưa vào Redis Blacklist.",
    data: result,
  });
});

/**
 * Lấy thông tin tài khoản hiện tại từ Token
 */
export const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Lấy thông tin tài khoản thành công.",
    data: {
      user: req.auth || req.user,
    },
  });
});

/**
 * Lấy trạng thái Redis Blacklist
 */
export const getRedisStatusController = asyncHandler(async (req, res) => {
  const status = getBlacklistStatus();
  res.status(200).json({
    success: true,
    data: status,
  });
});

