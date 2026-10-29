import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

/**
 * Băm mật khẩu bằng Bcrypt
 */
export async function hashPassword(plainPassword) {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

/**
 * So sánh mật khẩu gốc với mật khẩu đã băm
 */
export async function comparePassword(plainPassword, hashedPassword) {
  if (!plainPassword || !hashedPassword) return false;
  return bcrypt.compare(plainPassword, hashedPassword);
}

