import { describe, expect, it } from "vitest";
import { connectionStringForRuntime } from "./connection-string";

describe("connectionStringForRuntime", () => {
  it("mantém a URL quando não há certificado local", () => {
    const connectionString = "postgresql://postgres@db.example:5432/postgres?sslmode=require";

    expect(connectionStringForRuntime(connectionString)).toBe(connectionString);
  });

  it("mantém o certificado quando o arquivo existe", () => {
    const connectionString = `postgresql://postgres@db.example:5432/postgres?sslmode=verify-full&sslrootcert=${encodeURIComponent(__filename)}`;

    expect(connectionStringForRuntime(connectionString)).toBe(connectionString);
  });

  it("não tenta ler um certificado que não existe na Vercel", () => {
    const connectionString =
      "postgresql://postgres@db.example:5432/postgres?sslmode=verify-full&sslrootcert=%2Fhome%2Fmilton%2Fmissing.crt";

    expect(connectionStringForRuntime(connectionString)).toBe(
      "postgresql://postgres@db.example:5432/postgres?sslmode=no-verify",
    );
  });
});
