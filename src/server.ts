import { config } from "dotenv";

config();

import { app } from "./app";

const port = process.env.PORT || 3333;

const server = app.listen(port, () => {
  console.log(`API rodando em http://localhost:${port}`);
});

const shutdown = (): void => {
  server.close((error) => {
    if (error) {
      console.error("Erro ao encerrar o servidor:", error);
      process.exitCode = 1;
    }
  });
};

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);

export default app;
