import { verifyAccessToken } from "../security/token.service.js";
import { isTokenBlacklisted } from "../security/tokenBlacklist.service.js";
import { ApiError } from "../utils/ApiError.js";

/**
 * Middleware xác thực Access Token từ Header Authorization: Bearer <token>
 * Đồng thời kiểm tra xem token có nằm trong Redis Blacklist hay không.
 */
export async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(
      new ApiError(
        401,
        "Không tìm thấy Access Token hoặc định dạng Authorization header không hợp lệ (cần 'Bearer <token>')."
      )
    );
  }

  const token = authHeader.slice(7).trim();

  try {
    const decoded = verifyAccessToken(token);

    // Kiểm tra Redis Blacklist (kiểm tra theo JTI và theo toàn bộ chuỗi token)
    const isRevoked =
      (decoded.jti && (await isTokenBlacklisted(decoded.jti))) ||
      (await isTokenBlacklisted(token));

    if (isRevoked) {
      return next(
        new ApiError(
          401,
          "Token đã bị thu hồi do người dùng đã đăng xuất (Banned by Redis). Vui lòng đăng nhập lại."
        )
      );
    }

    const authData = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
      jti: decoded.jti,
      exp: decoded.exp,
      iat: decoded.iat,
    };

    req.auth = authData;
    req.user = authData;
    req.token = token;

    next();
  } catch (error) {
    next(error);
  }
}

export const authenticateToken = authenticate;
export default authenticate;

