import type { RequestHandler } from "express";
import { currentUser, login, register } from "./auth.service";

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

export const meController: RequestHandler = async (req, res, next) => {
  try {
    res.json(await currentUser(req.auth!.userId));
  } catch (error) {
    next(error);
  }
};
