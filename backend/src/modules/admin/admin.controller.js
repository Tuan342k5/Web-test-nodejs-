import * as adminService from "./admin.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

/**
 * Thống kê bảng điều khiển Admin
 */
export const getDashboardStats = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Bạn có quyền truy cập trang quản trị.",
    data: {
      userId: req.auth.id,
      role: req.auth.role,
      accessGrantedAt: new Date().toISOString(),
    },
  });
});

/**
 * Kiểm tra quyền Master Admin
 */
export const getMasterStatus = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Bạn có quyền MASTER_ADMIN tối cao.",
    data: {
      userId: req.auth.id,
      role: req.auth.role,
    },
  });
});

/**
 * Lấy thông số hệ thống & Redis (Master Admin)
 */
export const getSystemStatus = asyncHandler(async (req, res) => {
  const data = await adminService.getSystemStatus();
  res.status(200).json({
    success: true,
    data,
  });
});

/**
 * Lấy danh sách token bị ban trong Redis (Master Admin)
 */
export const getRedisBlacklist = asyncHandler(async (req, res) => {
  const data = await adminService.getBlacklistData();
  res.status(200).json({
    success: true,
    data,
  });
});

