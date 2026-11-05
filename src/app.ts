import express from "express";
import { errorHandler } from "./shared/middlewares/error-handler";
import { routes } from "./routes";

export const app = express();

app.use(express.json());
app.use("/api", routes);

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use(errorHandler);