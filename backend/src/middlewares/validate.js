import { ApiError } from "../utils/ApiError.js";

/**
 * Middleware xác thực dữ liệu đầu vào của request
 * @param {Function} validator Hàm kiểm tra dữ liệu trả về { isValid, message } hoặc throws
 */
export function validate(validator) {
  return (req, res, next) => {
    try {
      if (typeof validator === "function") {
        const result = validator(req);
        if (result && !result.isValid) {
          return next(new ApiError(400, result.message || "Dữ liệu yêu cầu không hợp lệ."));
        }
      }
      next();
    } catch (error) {
      next(new ApiError(400, error.message));
    }
  };
}

export default validate;

