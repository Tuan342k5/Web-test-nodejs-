import * as userRepository from "./user.repository.js";
import { ApiError } from "../../utils/ApiError.js";

export async function getUserProfile(userId, authMeta = {}) {
  const user = (await userRepository.findById(userId)) || authMeta;
  if (!user) {
    throw new ApiError(404, "Không tìm thấy người dùng.");
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name || authMeta.email?.split("@")[0],
    role: user.role,
    provider: user.provider || "local",
    avatar: user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.email}`,
    jti: authMeta.jti,
    exp: authMeta.exp,
    iat: authMeta.iat,
  };
}

export async function getAllUsers() {
  return userRepository.getAllUsers();
}

export async function toggleUserStatus(id) {
  return userRepository.toggleUserStatus(id);
}

export async function updateUserRole(id, role) {
  return userRepository.updateUserRole(id, role);
}

