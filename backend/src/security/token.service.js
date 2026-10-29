import "../config/env.js";
import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";
import { ApiError } from "../utils/ApiError.js";

export const JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || "15m";
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;

if (!JWT_ACCESS_SECRET || JWT_ACCESS_SECRET.length < 32) {
  throw new Error("JWT_ACCESS_SECRET phải được cấu hình và có ít nhất 32 ký tự.");
}

/**
 * Tạo Access Token JWT chuẩn RFC 7519
 */
export function createAccessToken(user) {
  return jwt.sign(
    {
      email: user.email,
      role: user.role,
    },
    JWT_ACCESS_SECRET,
    {
      subject: String(user.id),
      jwtid: randomUUID(),
      expiresIn: JWT_ACCESS_EXPIRES_IN,
      issuer: "auth-rbac-backend",
      audience: "auth-rbac-client",
    }
  );
}

/**
 * Xác thực Access Token
 */
export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, JWT_ACCESS_SECRET, {
      issuer: "auth-rbac-backend",
      audience: "auth-rbac-client",
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new ApiError(401, "Token đã hết hạn. Vui lòng đăng nhập lại.");
    }
    throw new ApiError(401, "Token không hợp lệ hoặc đã bị chỉnh sửa.");
  }
}

/**
 * Giải mã token mà không cần verify (để lấy jti, exp)
 */
export function decodeToken(token) {
  return jwt.decode(token);
}

