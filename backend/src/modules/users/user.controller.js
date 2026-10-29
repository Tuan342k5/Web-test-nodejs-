import * as userService from "./user.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

/**
 * Lấy thông tin tài khoản hiện tại
 */
export const getCurrentUser = asyncHandler(async (req, res) => {
  const profile = await userService.getUserProfile(req.auth.id, req.auth);
  res.status(200).json({
    success: true,
    message: "Lấy thông tin người dùng thành công.",
    data: {
      user: profile,
      ...profile,
    },
  });
});

/**
 * Lấy danh sách toàn bộ người dùng
 */
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await userService.getAllUsers();
  res.status(200).json({
    success: true,
    data: users,
  });
});

/**
 * Khóa hoặc Mở khóa tài khoản
 */
export const toggleUserStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updated = await userService.toggleUserStatus(id);
  res.status(200).json({
    success: true,
    message: `Đã ${updated.active ? "kích hoạt" : "tạm khóa"} tài khoản ${updated.email}.`,
    data: updated,
  });
});

/**
 * Đổi vai trò tài khoản
 */
export const updateUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  const updated = await userService.updateUserRole(id, role);
  res.status(200).json({
    success: true,
    message: `Đã cập nhật vai trò của ${updated.email} thành ${updated.role}.`,
    data: updated,
  });
});

