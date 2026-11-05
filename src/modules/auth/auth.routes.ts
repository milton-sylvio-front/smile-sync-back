import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authenticate } from "../../shared/middlewares/authenticate";
import { validateBody } from "../../shared/middlewares/validate";
import { loginController, meController, registerController } from "./auth.controller";
import { loginSchema, registerSchema } from "./auth.schemas";

const router = Router();
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/register", authRateLimit, validateBody(registerSchema), registerController);
router.post("/login", authRateLimit, validateBody(loginSchema), loginController);
router.get("/me", authenticate, meController);

export { router as authRoutes };
