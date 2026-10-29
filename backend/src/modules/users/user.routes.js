import { Router } from "express";
import { getCurrentUser } from "./user.controller.js";
import { authenticate } from "../../middlewares/authenticate.js";

const router = Router();

// Tất cả endpoints dưới /user đều cần token hợp lệ
router.use(authenticate);

router.get("/profile", getCurrentUser);

export default router;

