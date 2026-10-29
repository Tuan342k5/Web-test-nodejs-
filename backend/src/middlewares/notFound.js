import { ApiError } from "../utils/ApiError.js";

export function notFound(req, res, next) {
  next(new ApiError(404, `Endpoint ${req.originalUrl} không tồn tại trên máy chủ.`));
}

export default notFound;

