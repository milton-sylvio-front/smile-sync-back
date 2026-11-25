import { config } from "dotenv";

config();
import { app } from "./app";

const PORT = process.env.PORT || 3333;

function listen(): Promise<ReturnType<typeof app.listen>> {
  return new Promise((resolve, reject) => {
    const server = app.listen(PORT, () => {
      console.log(`API rodando em http://localhost:${PORT}`);
      resolve(server);
    });
    server.once("error", reject);
  });
}

async function startServer(): Promise<void> {
  const server = await listen();

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
}

void startServer().catch((error: unknown) => {
  console.error("Não foi possível iniciar a API:", error);
  process.exitCode = 1;
});