import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { AppError } from "../errors/app-error";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({ error: error.message });
    return;
  }

  if (error instanceof ZodError) {
    res.status(400).json({
      error: "Dados inválidos.",
      details: error.issues.map(({ path, message }) => ({
        path: path.join("."),
        message,
      })),
    });
    return;
  }

  const databaseError = error as { code?: string };
  if (databaseError.code === "23505" || databaseError.code === "23503") {
    res.status(409).json({
      error:
        databaseError.code === "23505"
          ? "Já existe um registro com esses dados."
          : "O registro está relacionado a outros dados e não pode ser removido.",
    });
    return;
  }

  console.error("Erro não tratado na API:", error);
  res.status(500).json({ error: "Erro interno do servidor." });
};
