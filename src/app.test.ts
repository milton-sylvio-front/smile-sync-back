import { createServer } from "node:http";
import { afterEach, describe, expect, it, vi } from "vitest";
import { app } from "./app";

async function preflight(origin: string, application = app): Promise<Response> {
  const server = createServer(application);

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });

  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Could not determine the test server address.");
  }

  try {
    return await fetch(`http://127.0.0.1:${address.port}/api/auth/register`, {
      method: "OPTIONS",
      headers: {
        Origin: origin,
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "content-type",
      },
    });
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

describe("CORS", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("allows the local frontend to preflight the registration endpoint", async () => {
    const response = await preflight("http://localhost:3000");

    expect(response.status).toBe(204);
    expect(response.headers.get("access-control-allow-origin")).toBe(
      "http://localhost:3000",
    );
    expect(response.headers.get("access-control-allow-methods")).toContain("POST");
    expect(response.headers.get("access-control-allow-headers")).toContain("content-type");
  });

  it("allows the production frontend when CORS_ORIGINS is unset", async () => {
    const response = await preflight("https://smile-sync-front.vercel.app");

    expect(response.status).toBe(204);
    expect(response.headers.get("access-control-allow-origin")).toBe(
      "https://smile-sync-front.vercel.app",
    );
  });

  it("allows the production frontend when CORS_ORIGINS is configured", async () => {
    vi.stubEnv("CORS_ORIGINS", "http://localhost:3000");
    vi.resetModules();
    const { app: configuredApp } = await import("./app.js");

    const response = await preflight(
      "https://smile-sync-front.vercel.app",
      configuredApp,
    );

    expect(response.status).toBe(204);
    expect(response.headers.get("access-control-allow-origin")).toBe(
      "https://smile-sync-front.vercel.app",
    );
  });

  it("does not allow an unconfigured origin", async () => {
    const response = await preflight("https://untrusted.example");

    expect(response.headers.get("access-control-allow-origin")).toBeNull();
  });
});
