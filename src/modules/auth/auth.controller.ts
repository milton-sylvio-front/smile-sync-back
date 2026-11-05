import type { RequestHandler } from "express";
import { login, register } from "./auth.service";

export const registerController: RequestHandler = async (req, res, next) => {
  try {
    res.status(201).json(await register(req.body));
  } catch (error) {
    next(error);
  }
};

export const loginController: RequestHandler = async (req, res, next) => {
  try {
    res.json(await login(req.body));
  } catch (error) {
    next(error);
  }
};

export const meController: RequestHandler = (req, res) => {
  res.json({
    userId: req.auth!.userId,
    clinicId: req.auth!.clinicId,
    role: req.auth!.role,
  });
};
