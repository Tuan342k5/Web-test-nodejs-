import * as authService from "../services/auth.service.js";
import { authenticateWithGoogle } from "../services/sso.service.js";
import {
  createAccessToken,
  JWT_ACCESS_EXPIRES_IN,
  verifyAccessToken,
} from "../services/token.service.js";
import {
  blacklistToken,
  getRedisStatus,
} from "../services/redis.service.js";

/**
 * Đăng nhập chuẩn bằng Email & Mật khẩu
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await authService.login(email, password);
    const accessToken = createAccessToken(user);

    return res.status(200).json({
      success: true,
      message: "Đăng nhập thành công.",
      data: {
        accessToken,
        tokenType: "Bearer",
        expiresIn: JWT_ACCESS_EXPIRES_IN,
        user,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Đăng nhập bằng Google SSO (Tự động đăng ký vào DB nếu tài khoản mới)
 */
export async function ssoGoogleLogin(req, res, next) {
  try {
    const { email, name, avatar, role, credential } = req.body;

    const result = await authenticateWithGoogle({
      email,
      name,
      avatar,
      role,
      credential,
    });

    const actionText = result.isNewAccount
      ? "Đăng ký và đăng nhập tài khoản Google SSO mới thành công!"
      : "Đăng nhập Google SSO thành công.";

    return res.status(200).json({
      success: true,
      message: actionText,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Đăng xuất và đưa Token / JTI vào Redis Blacklist với TTL còn lại
 */
export async function logout(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(400).json({
        success: false,
        message: "Không tìm thấy token trong header Authorization.",
      });
    }

    const token = authHeader.slice(7).trim();
    let ttlSeconds = 900;
    let jti = null;
    let email = req.auth?.email || "N/A";
    let role = req.auth?.role || "N/A";

    try {
      const decoded = verifyAccessToken(token);
      jti = decoded.jti;
      email = decoded.email || email;
      role = decoded.role || role;
      const now = Math.floor(Date.now() / 1000);
      if (decoded.exp && decoded.exp > now) {
        ttlSeconds = decoded.exp - now;
      }
    } catch {
      // Token có thể đã hết hạn hoặc không verify được
    }

    const entry = await blacklistToken(jti || token, ttlSeconds, { email, role });

    return res.status(200).json({
      success: true,
      message: "Đăng xuất thành công. Token đã được thu hồi và đưa vào Redis Blacklist.",
      data: {
        bannedKey: jti || "token",
        ttlSeconds,
        entry,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Lấy thông tin tài khoản hiện tại từ Token
 */
export async function getMe(req, res, next) {
  try {
    return res.status(200).json({
      success: true,
      message: "Lấy thông tin tài khoản thành công.",
      data: {
        user: req.auth || req.user,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Lấy trạng thái kết nối Redis
 */
export async function getRedisInfo(req, res, next) {
  try {
    const status = getRedisStatus();
    return res.status(200).json({
      success: true,
      data: status,
    });
  } catch (error) {
    next(error);
  }
}
