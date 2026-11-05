import type { RequestHandler } from "express";
import { AppError } from "../errors/app-error";
import type { UserRole } from "../../modules/auth/auth.model";

export function authorize(...roles: UserRole[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.auth) {
      next(new AppError("Autenticação necessária.", 401));
      return;
    }

    if (!roles.includes(req.auth.role)) {
      next(new AppError("Você não tem permissão para esta ação.", 403));
      return;
    }

    next();
  };
}
