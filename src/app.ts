import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import type {} from "./shared/types/express";
import { errorHandler } from "./shared/middlewares/error-handler";
import { openApiSpec } from "./openapi";
import { routes } from "./routes";

export const app = express();

const allowedOrigins = new Set([
  "https://smile-sync-front.vercel.app",
  ...(process.env.CORS_ORIGINS ??
    "http://localhost:3000,http://127.0.0.1:3000"
  )
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean),
]);

app.use(cors({ origin: [...allowedOrigins] }));
app.use(express.json());
app.get("/api-docs.json", (_req, res) => {
  res.json(openApiSpec);
});
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(openApiSpec, { customSiteTitle: "Smile Sync API" }),
);
app.use("/api", routes);

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use(errorHandler);