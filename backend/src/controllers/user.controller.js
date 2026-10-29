import * as userRepository from "../repositories/user.repository.js";
import { getBlacklistedTokens, getRedisStatus } from "../services/redis.service.js";

/**
 * Lấy thông tin chi tiết của người dùng đang đăng nhập
 */
export async function getCurrentUser(req, res, next) {
  try {
    const user = await userRepository.findById(req.auth.id) || req.auth;
    return res.status(200).json({
      success: true,
      message: "Lấy thông tin người dùng thành công.",
      data: {
        id: user.id,
        email: user.email,
        name: user.name || req.auth.email.split("@")[0],
        role: user.role,
        provider: user.provider || "local",
        avatar: user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.email}`,
        jti: req.auth.jti,
        exp: req.auth.exp,
        iat: req.auth.iat,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Lấy danh sách toàn bộ người dùng trong hệ thống (Quyền ADMIN & MASTER_ADMIN)
 */
export async function getAllUsers(req, res, next) {
  try {
    const users = await userRepository.getAllUsers();
    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Khóa / Mở khóa tài khoản (Quyền ADMIN & MASTER_ADMIN)
 */
export async function toggleUserStatus(req, res, next) {
  try {
    const { id } = req.params;
    const updated = await userRepository.toggleUserStatus(id);
    return res.status(200).json({
      success: true,
      message: `Đã ${updated.active ? "kích hoạt" : "tạm khóa"} tài khoản ${updated.email}.`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Đổi vai trò tài khoản (Chỉ dành cho MASTER_ADMIN)
 */
export async function updateUserRole(req, res, next) {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const updated = await userRepository.updateUserRole(id, role);
    return res.status(200).json({
      success: true,
      message: `Đã cập nhật vai trò của ${updated.email} thành ${updated.role}.`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Lấy danh sách token đang bị Redis ban (Chỉ dành cho MASTER_ADMIN)
 */
export async function getRedisBlacklist(req, res, next) {
  try {
    const tokens = await getBlacklistedTokens();
    const redisInfo = getRedisStatus();
    return res.status(200).json({
      success: true,
      data: {
        redisStatus: redisInfo,
        blacklistedTokens: tokens,
      },
    });
  } catch (error) {
    next(error);
  }
}
