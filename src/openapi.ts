export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Smile Sync API",
    version: "1.0.0",
    description: "Documentação da API do Smile Sync.",
  },
  servers: [{ url: "/" }],
  paths: {
    "/health": {
      get: {
        summary: "Verifica a disponibilidade da API",
        tags: ["Health"],
        responses: {
          "200": {
            description: "API disponível",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { ok: { type: "boolean", example: true } },
                },
              },
            },
          },
        },
      },
    },
    "/api/auth/register": {
      post: {
        summary: "Registra uma clínica e seu primeiro usuário",
        tags: ["Autenticação"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["clinicName", "name", "email", "password"],
                properties: {
                  clinicName: { type: "string", minLength: 2, maxLength: 160 },
                  name: { type: "string", minLength: 2, maxLength: 160 },
                  email: { type: "string", format: "email" },
                  password: { type: "string", minLength: 12, maxLength: 128 },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Clínica e usuário registrados" },
          "400": { description: "Dados inválidos" },
        },
      },
    },
    "/api/auth/login": {
      post: {
        summary: "Autentica um usuário",
        tags: ["Autenticação"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string", minLength: 1, maxLength: 128 },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Autenticação realizada" },
          "400": { description: "Dados inválidos" },
          "401": { description: "Credenciais inválidas" },
        },
      },
    },
    "/api/auth/me": {
      get: {
        summary: "Retorna o usuário autenticado",
        tags: ["Autenticação"],
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Dados do usuário autenticado" },
          "401": { description: "Autenticação necessária" },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer" },
    },
  },
};
