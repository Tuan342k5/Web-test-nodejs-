
import * as authService from "../services/auth.service.js";

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await authService.login(email, password);

    return res.status(200).json({
      success: true,
      message: "Đăng nhập thành công.",
      data: { user },
    });
  } catch (error) {
    next(error);
  }
}
