import "../config/env.js";
import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";

export const JWT_ACCESS_EXPIRES_IN =
  process.env.JWT_ACCESS_EXPIRES_IN || "15m";
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;

if (!JWT_ACCESS_SECRET || JWT_ACCESS_SECRET.length < 32) {
  throw new Error(
    "JWT_ACCESS_SECRET phải được cấu hình và có ít nhất 32 ký tự."
  );
}

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
      issuer: "auth-rbac-demo",
      audience: "auth-rbac-demo-client",
    }
  );
}

export function verifyAccessToken(token) {
  return jwt.verify(token, JWT_ACCESS_SECRET, {
    issuer: "auth-rbac-demo",
    audience: "auth-rbac-demo-client",
  });
}
