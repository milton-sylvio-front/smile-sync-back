import type { RequestHandler } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { AppError } from "../errors/app-error";
import { userRoles, type UserRole } from "../../modules/auth/auth.model";

interface AccessTokenPayload extends JwtPayload {
  clinicId: string;
  role: UserRole;
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("A variável JWT_SECRET não está configurada.");
  }
  if (secret.length < 32) {
    throw new Error("JWT_SECRET deve possuir pelo menos 32 caracteres.");
  }
  return secret;
}

export const authenticate: RequestHandler = (req, _res, next) => {
  const authorization = req.header("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    next(new AppError("Autenticação necessária.", 401));
    return;
  }

  try {
    const token = authorization.slice("Bearer ".length);
    const payload = jwt.verify(token, getJwtSecret(), {
      algorithms: ["HS256"],
    }) as AccessTokenPayload;

    if (
      typeof payload.sub !== "string" ||
      typeof payload.clinicId !== "string" ||
      !userRoles.includes(payload.role)
    ) {
      throw new AppError("Token de acesso inválido.", 401);
    }

    req.auth = {
      userId: payload.sub,
      clinicId: payload.clinicId,
      role: payload.role,
    };
    next();
  } catch (error) {
    next(
      error instanceof AppError
        ? error
        : new AppError("Token de acesso inválido ou expirado.", 401),
    );
  }
};
