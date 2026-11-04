import { config } from "dotenv";

config();
import { connectToSupabase } from "./database/supabase";
import { app } from "./app";

const PORT = process.env.PORT || 3333;

async function startServer(): Promise<void> {
  await connectToSupabase();

  const server = app.listen(PORT, () => {
    console.log(`API rodando em http://localhost:${PORT}`);
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
}

void startServer().catch((error: unknown) => {
  console.error("Não foi possível iniciar a API com a conexão Supabase:", error);
  process.exitCode = 1;
});