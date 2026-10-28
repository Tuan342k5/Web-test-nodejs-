
import bcrypt from "bcryptjs";
import { findByEmail } from "../repositories/user.repository.js";

export async function login(email, password) {
  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    !email.trim() ||
    !password
  ) {
    const error = new Error("Email và password là bắt buộc.");
    error.statusCode = 400;
    throw error;
  }

  const user = await findByEmail(email.trim());

  // Không tiết lộ email có tồn tại trong hệ thống hay không.
  if (!user || !user.active) {
    const error = new Error("Email hoặc mật khẩu không đúng.");
    error.statusCode = 401;
    throw error;
  }

  const passwordMatches = await bcrypt.compare(
    password,
    user.passwordHash
  );

  if (!passwordMatches) {
    const error = new Error("Email hoặc mật khẩu không đúng.");
    error.statusCode = 401;
    throw error;
  }

  // Chưa cấp JWT ở bước này.
  // Chỉ trả thông tin công khai để hiểu luồng xử lý.
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}
