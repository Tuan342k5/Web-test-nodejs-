import * as authService from "../services/auth.service.js";
import {
  createAccessToken,
  JWT_ACCESS_EXPIRES_IN,
} from "../services/token.service.js";

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await authService.login(email, password);
    const accessToken = createAccessToken(user);

    return res.status(200).json({
      success: true,
      message: "Đăng nhập thành công.",
      data: {
        accessToken,
        tokenType: "Bearer",
        expiresIn: JWT_ACCESS_EXPIRES_IN,
        user,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getMe(req, res, next) {
  try {
    return res.status(200).json({
      success: true,
      message: "Lấy thông tin tài khoản thành công.",
      data: {
        user: req.user,
      },
    });
  } catch (error) {
    next(error);
  }
}
