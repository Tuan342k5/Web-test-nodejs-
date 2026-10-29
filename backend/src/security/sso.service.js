import { findOrCreateSSOUser } from "../modules/users/user.repository.js";
import { createAccessToken, JWT_ACCESS_EXPIRES_IN } from "./token.service.js";
import { googleOAuthConfig } from "../config/passport.js";
import { ApiError } from "../utils/ApiError.js";

/**
 * Tạo URL chuyển hướng đăng nhập Google OAuth 2.0
 */
export function getGoogleOAuthUrl(state = "") {
  if (!googleOAuthConfig.clientID) {
    throw new ApiError(500, "Thiếu GOOGLE_CLIENT_ID trong biến môi trường.");
  }

  const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
  const options = {
    redirect_uri: googleOAuthConfig.callbackURL,
    client_id: googleOAuthConfig.clientID,
    access_type: "offline",
    response_type: "code",
    prompt: "select_account",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
      "openid",
    ].join(" "),
    ...(state ? { state } : {}),
  };

  const qs = new URLSearchParams(options);
  return `${rootUrl}?${qs.toString()}`;
}

/**
 * Xử lý Authorization Code được Google gửi về tại GOOGLE_CALLBACK_URL
 */
export async function handleGoogleCallback(code) {
  if (!code) {
    throw new ApiError(400, "Không tìm thấy authorization code từ Google.");
  }

  // 1. Gửi request đổi Authorization Code lấy Token tại Google OAuth2
  const tokenUrl = "https://oauth2.googleapis.com/token";
  const params = {
    code,
    client_id: googleOAuthConfig.clientID,
    client_secret: googleOAuthConfig.clientSecret,
    redirect_uri: googleOAuthConfig.callbackURL,
    grant_type: "authorization_code",
  };

  const tokenResponse = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(params).toString(),
  });

  const tokenData = await tokenResponse.json();

  if (!tokenResponse.ok) {
    const errMsg = tokenData.error_description || tokenData.error || "Lỗi khi trao đổi token với Google.";
    console.error("[SSO Google Callback] Token Error:", errMsg);
    throw new ApiError(400, `Xác thực Google thất bại: ${errMsg}`);
  }

  const { access_token } = tokenData;

  // 2. Lấy thông tin người dùng từ Google UserInfo API
  const userResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${access_token}` },
  });

  if (!userResponse.ok) {
    throw new ApiError(400, "Không thể lấy thông tin người dùng từ tài khoản Google.");
  }

  const googleUser = await userResponse.json();
  const email = googleUser.email;
  const name = googleUser.name || googleUser.given_name || email.split("@")[0];
  const avatar = googleUser.picture;

  if (!email) {
    throw new ApiError(400, "Không thể xác định địa chỉ email từ tài khoản Google.");
  }

  // 3. Tự động lưu hoặc tìm kiếm người dùng trong Database PostgreSQL
  const { user, isNew } = await findOrCreateSSOUser({
    email,
    name,
    avatar,
    provider: "google",
  });

  if (!user.active) {
    throw new ApiError(403, "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.");
  }

  // 4. Tạo Access Token chuẩn JWT của hệ thống
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
      avatar: user.avatar || avatar,
      provider: "google",
    },
  };
}

/**
 * Xử lý xác thực Google SSO qua Google Identity Services (credential token) hoặc body JSON
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
