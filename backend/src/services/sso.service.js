import { findOrCreateSSOUser } from "../repositories/user.repository.js";
import { createAccessToken, JWT_ACCESS_EXPIRES_IN } from "./token.service.js";

/**
 * Xử lý đăng nhập và tự động đăng ký tài khoản Google SSO vào Database
 */
export async function authenticateWithGoogle({ email, name, avatar, role, credential }) {
  let userEmail = email;
  let userName = name;
  let userAvatar = avatar;
  let userRole = role;

  // Nếu frontend gửi Google ID Token (credential từ Google Identity Services)
  if (credential) {
    try {
      const base64Url = credential.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      const googlePayload = JSON.parse(jsonPayload);
      userEmail = googlePayload.email;
      userName = googlePayload.name || googlePayload.email.split("@")[0];
      userAvatar = googlePayload.picture;
    } catch (err) {
      console.warn("Không thể giải mã Google credential, sử dụng payload cơ bản:", err.message);
    }
  }

  if (!userEmail) {
    const error = new Error("Email Google là bắt buộc để đăng nhập SSO.");
    error.statusCode = 400;
    throw error;
  }

  // Tự động tìm hoặc đăng ký mới vào Database
  const { user, isNew } = await findOrCreateSSOUser({
    email: userEmail,
    name: userName,
    avatar: userAvatar,
    role: userRole,
    provider: "google",
  });

  if (!user.active) {
    const error = new Error("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.");
    error.statusCode = 403;
    throw error;
  }

  const accessToken = createAccessToken(user);

  return {
    accessToken,
    tokenType: "Bearer",
    expiresIn: JWT_ACCESS_EXPIRES_IN,
    isNewAccount: isNew,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      provider: user.provider,
    },
  };
}

