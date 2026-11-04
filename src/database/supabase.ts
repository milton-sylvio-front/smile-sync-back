import { pipeline } from "@supabase/middleware";
import {
  withPostgresAdminClient,
  type PostgresApi,
} from "@supabase/server/middleware/postgres-admin";

const requestUrl = "http://localhost/internal/database";

async function runWithPostgres<T>(
  operation: (postgres: PostgresApi) => Promise<T>,
): Promise<T> {
  const connectionString = process.env.SUPABASE_DB_URL;

  if (!connectionString) {
    throw new Error("A variável SUPABASE_DB_URL não está configurada.");
  }

  let result: T;
  let completed = false;

  const handler = pipeline(
    [withPostgresAdminClient({ connectionString })],
    async (_request, { postgresAdmin }) => {
      result = await operation(postgresAdmin);
      completed = true;
      return new Response(null, { status: 204 });
    },
  );

  const response = await handler(new Request(requestUrl));

  if (!response.ok) {
    throw new Error(
      `O middleware PostgreSQL do Supabase respondeu com HTTP ${response.status}.`,
    );
  }

  if (!completed) {
    throw new Error("A consulta PostgreSQL não foi executada.");
  }

  return result!;
}

export async function connectToSupabase(): Promise<void> {
  const rows = await querySupabase<{ ok: number }>("SELECT 1 AS ok");

  if (rows.length !== 1 || rows[0].ok !== 1) {
    throw new Error("A verificação de conexão com Supabase retornou resultado inválido.");
  }
}

export function querySupabase<T = Record<string, unknown>>(
  text: string,
  values?: unknown[],
): Promise<T[]> {
  return runWithPostgres((postgres) => postgres.queryRaw<T>(text, values));
}
