import * as authService from "./auth.service.js";
import { getBlacklistStatus } from "../../security/tokenBlacklist.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { googleOAuthConfig } from "../../config/passport.js";

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
 * Chuyển hướng trình duyệt đến trang xác thực Google OAuth 2.0
 */
export const redirectToGoogle = asyncHandler(async (req, res) => {
  const state = req.query.state || "";
  const googleAuthUrl = authService.getGoogleLoginUrl(state);

  // Nếu client gọi lấy link dạng JSON
  if (req.headers.accept?.includes("application/json") || req.query.format === "json") {
    return res.status(200).json({
      success: true,
      url: googleAuthUrl,
    });
  }

  // Chuyển hướng trình duyệt đến Google Sign-in
  res.redirect(googleAuthUrl);
});

/**
 * Xử lý callback khi Google trả về tại GOOGLE_CALLBACK_URL
 */
export const handleGoogleCallbackController = asyncHandler(async (req, res) => {
  const { code, error, error_description } = req.query;
  const frontendUrl = googleOAuthConfig.frontendURL || "http://localhost:5173";

  // Người dùng từ chối hoặc Google trả về lỗi
  if (error) {
    console.warn("[Google OAuth Callback Error]:", error, error_description);
    return res.redirect(
      `${frontendUrl}/login?error=${encodeURIComponent(
        error_description || "Đăng nhập bằng tài khoản Google đã bị hủy."
      )}`
    );
  }

  if (!code) {
    return res.redirect(
      `${frontendUrl}/login?error=${encodeURIComponent("Không nhận được authorization code từ Google.")}`
    );
  }

  try {
    const result = await authService.processGoogleCallback(code);
    // Điều hướng về SsoCallbackPage trên Frontend cùng Access Token
    res.redirect(`${frontendUrl}/sso/callback?token=${result.accessToken}`);
  } catch (err) {
    console.error("[Google OAuth Callback Processing Error]:", err.message);
    res.redirect(
      `${frontendUrl}/login?error=${encodeURIComponent(
        err.message || "Lỗi xử lý đăng nhập Google."
      )}`
    );
  }
});

/**
 * Đăng nhập Google SSO (qua Google Identity Services credential hoặc body JSON)
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
