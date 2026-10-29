import { findOrCreateSSOUser } from "../modules/users/user.repository.js";
import { createAccessToken, JWT_ACCESS_EXPIRES_IN } from "./token.service.js";
import { ApiError } from "../utils/ApiError.js";

/**
 * Xử lý xác thực Google SSO và tự động lưu tài khoản vào Database
 */
export async function authenticateWithGoogle({ email, name, avatar, role, credential }) {
  let userEmail = email;
  let userName = name;
  let userAvatar = avatar;
  let userRole = role;

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
      console.warn("[SSO] Không thể giải mã credential:", err.message);
    }
  }

  if (!userEmail) {
    throw new ApiError(400, "Email Google là bắt buộc để đăng nhập SSO.");
  }

  const { user, isNew } = await findOrCreateSSOUser({
    email: userEmail,
    name: userName,
    avatar: userAvatar,
    role: userRole,
    provider: "google",
  });

  if (!user.active) {
    throw new ApiError(403, "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.");
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
      provider: user.provider || "google",
    },
  };
}

