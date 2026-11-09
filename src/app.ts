import express from "express";
import swaggerUi from "swagger-ui-express";
import { errorHandler } from "./shared/middlewares/error-handler";
import { openApiSpec } from "./openapi";
import { routes } from "./routes";

export const app = express();

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