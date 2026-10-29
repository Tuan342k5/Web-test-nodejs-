import * as authRepository from "./auth.repository.js";
import { comparePassword } from "../../security/password.service.js";
import { createAccessToken, verifyAccessToken, JWT_ACCESS_EXPIRES_IN } from "../../security/token.service.js";
import { blacklistToken } from "../../security/tokenBlacklist.service.js";
import {
  authenticateWithGoogle,
  getGoogleOAuthUrl,
  handleGoogleCallback,
} from "../../security/sso.service.js";
import { ApiError } from "../../utils/ApiError.js";

/**
 * Xử lý đăng nhập thông thường
 */
export async function login(email, password) {
  const user = await authRepository.findByEmail(email.trim());

  if (!user || !user.active) {
    throw new ApiError(401, "Email hoặc mật khẩu không chính xác.");
  }

  const isMatch = await comparePassword(password, user.passwordHash);
  if (!isMatch) {
    throw new ApiError(401, "Email hoặc mật khẩu không chính xác.");
  }

  const accessToken = createAccessToken(user);

  return {
    accessToken,
    tokenType: "Bearer",
    expiresIn: JWT_ACCESS_EXPIRES_IN,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  };
}

/**
 * Lấy URL Google OAuth để chuyển hướng người dùng
 */
export function getGoogleLoginUrl(state) {
  return getGoogleOAuthUrl(state);
}

/**
 * Xử lý callback từ Google sau khi người dùng xác thực thành công
 */
export async function processGoogleCallback(code) {
  return handleGoogleCallback(code);
}

/**
 * Xử lý đăng nhập Google SSO (qua Google Identity Services credential hoặc body)
 */
export async function loginWithSSO(payload) {
  return authenticateWithGoogle(payload);
}

/**
 * Xử lý đăng xuất (Thu hồi token vào Redis)
 */
export async function logout(authHeader, userMeta = {}) {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new ApiError(400, "Không tìm thấy token trong header Authorization.");
  }

  const token = authHeader.slice(7).trim();
  let ttlSeconds = 900;
  let jti = null;
  let email = userMeta.email || "N/A";
  let role = userMeta.role || "N/A";

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
    // Nếu token đã hết hạn hoặc không verify được vẫn tiếp tục thu hồi
  }

  if (jti) {
    await blacklistToken(jti, ttlSeconds, { email, role, type: "jti" });
  }
  const entry = await blacklistToken(token, ttlSeconds, { email, role, type: "token" });

  return {
    bannedKey: jti || "token",
    ttlSeconds,
    entry,
  };
}
