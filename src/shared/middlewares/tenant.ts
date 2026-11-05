import type { RequestHandler } from "express";
import { AppError } from "../errors/app-error";

export const requireTenant: RequestHandler = (req, _res, next) => {
  if (!req.auth?.clinicId) {
    next(new AppError("Clínica não identificada.", 403));
    return;
  }
  next();
};
