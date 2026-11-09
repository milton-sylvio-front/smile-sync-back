type Schema = Record<string, unknown>;

interface ResourceDocumentation {
  path: string;
  tag: string;
  name: string;
  fields: Record<string, Schema>;
  required?: string[];
  readOnly?: boolean;
}

const uuid: Schema = { type: "string", format: "uuid" };
const dateTime: Schema = { type: "string", format: "date-time" };
const string: Schema = { type: "string" };
const nullableString: Schema = { type: "string", nullable: true };
const integer: Schema = { type: "integer" };
const boolean: Schema = { type: "boolean" };
const stringArray: Schema = { type: "array", items: string };
const jsonObject: Schema = { type: "object", additionalProperties: true };
const enumString = (...values: string[]): Schema => ({
  type: "string",
  enum: values,
});
const boundedString = (minLength: number, maxLength: number): Schema => ({
  type: "string",
  minLength,
  maxLength,
});

const resources: ResourceDocumentation[] = [
  {
    path: "/api/appointments",
    tag: "Agendamentos",
    name: "Agendamento",
    required: ["patientId", "professionalId", "startAt", "endAt"],
    fields: {
      patientId: uuid,
      professionalId: uuid,
      startAt: dateTime,
      endAt: dateTime,
      status: enumString(
        "SCHEDULED",
        "CONFIRMED",
        "CHECKED_IN",
        "IN_PROGRESS",
        "COMPLETED",
        "NO_SHOW",
        "CANCELLED",
      ),
      confirmationStatus: enumString("PENDING", "CONFIRMED", "DECLINED"),
      confirmedAt: { ...dateTime, nullable: true },
      confirmationChannel: { ...nullableString, maxLength: 100 },
      notes: { ...nullableString, maxLength: 5000 },
      source: enumString("MANUAL", "WHATSAPP", "ONLINE"),
      cancelReason: { ...nullableString, maxLength: 1000 },
    },
  },
  {
    path: "/api/audit",
    tag: "Auditoria",
    name: "Registro de auditoria",
    fields: {},
    readOnly: true,
  },
  {
    path: "/api/billing",
    tag: "Assinaturas",
    name: "Assinatura",
    fields: {},
    readOnly: true,
  },
  {
    path: "/api/clinics/business-hours",
    tag: "Clínicas",
    name: "Horário de atendimento",
    required: ["weekday", "startTime", "endTime"],
    fields: {
      weekday: { type: "integer", minimum: 0, maximum: 6 },
      startTime: { type: "string", pattern: "^(?:[01]\\d|2[0-3]):[0-5]\\d$" },
      endTime: { type: "string", pattern: "^(?:[01]\\d|2[0-3]):[0-5]\\d$" },
    },
  },
  {
    path: "/api/documents",
    tag: "Documentos",
    name: "Documento",
    required: ["patientId", "kind", "fileName", "mimeType", "sizeBytes", "storageKey"],
    fields: {
      patientId: uuid,
      kind: enumString("XRAY", "PHOTO", "EXAM", "CONSENT_FORM", "CONTRACT", "OTHER"),
      fileName: boundedString(1, 255),
      mimeType: boundedString(1, 160),
      sizeBytes: { type: "integer", minimum: 1 },
      storageKey: boundedString(1, 1024),
    },
  },
  {
    path: "/api/finance/categories",
    tag: "Financeiro",
    name: "Categoria financeira",
    required: ["name", "type"],
    fields: {
      name: boundedString(1, 100),
      type: enumString("INCOME", "EXPENSE"),
    },
  },
  {
    path: "/api/finance/transactions",
    tag: "Financeiro",
    name: "Transação financeira",
    required: ["type", "categoryId", "description", "amountCents", "dueDate"],
    fields: {
      type: enumString("INCOME", "EXPENSE"),
      categoryId: uuid,
      description: boundedString(1, 500),
      amountCents: { type: "integer", minimum: 1 },
      dueDate: dateTime,
      paidAt: { ...dateTime, nullable: true },
      status: enumString("PENDING", "PAID", "OVERDUE", "CANCELLED"),
      method: enumString("PIX", "CARD", "CASH", "BOLETO", "TRANSFER"),
      patientId: { ...uuid, nullable: true },
      appointmentId: { ...uuid, nullable: true },
      treatmentPlanId: { ...uuid, nullable: true },
      installmentNumber: { type: "integer", minimum: 1, nullable: true },
      installmentTotal: { type: "integer", minimum: 1, nullable: true },
      installmentGroupId: { ...uuid, nullable: true },
    },
  },
  {
    path: "/api/patients",
    tag: "Pacientes",
    name: "Paciente",
    required: ["name"],
    fields: {
      name: boundedString(1, 160),
      birthDate: { ...dateTime, nullable: true },
      sex: { ...enumString("M", "F", "O"), nullable: true },
      phone: { ...nullableString, maxLength: 40 },
      whatsapp: { ...nullableString, maxLength: 40 },
      email: { type: "string", format: "email", nullable: true },
      address: { ...jsonObject, nullable: true },
      guardianName: { ...nullableString, maxLength: 160 },
      guardianPhone: { ...nullableString, maxLength: 40 },
      guardianRelationship: { ...nullableString, maxLength: 80 },
      insuranceName: { ...nullableString, maxLength: 160 },
      insuranceCard: { ...nullableString, maxLength: 100 },
      status: enumString("ACTIVE", "INACTIVE", "ARCHIVED"),
      tags: { type: "array", items: { type: "string", maxLength: 60 }, maxItems: 30 },
    },
  },
  {
    path: "/api/procedures",
    tag: "Procedimentos",
    name: "Procedimento",
    required: ["name", "priceCents"],
    fields: {
      name: boundedString(1, 160),
      code: { ...nullableString, maxLength: 40 },
      category: { ...nullableString, maxLength: 100 },
      priceCents: { type: "integer", minimum: 0 },
      durationMinutes: { type: "integer", minimum: 1, maximum: 1440 },
      isActive: boolean,
    },
  },
  {
    path: "/api/reactivation/campaigns",
    tag: "Reativação",
    name: "Campanha de reativação",
    required: ["name", "inactiveDays"],
    fields: {
      name: boundedString(1, 160),
      inactiveDays: { type: "integer", minimum: 1, maximum: 3650 },
      tags: { type: "array", items: { type: "string", maxLength: 60 }, maxItems: 30 },
      strategy: enumString("AI", "TEMPLATE"),
      status: enumString("DRAFT", "RUNNING", "FINISHED"),
    },
  },
  {
    path: "/api/records",
    tag: "Prontuários",
    name: "Prontuário clínico",
    required: ["patientId"],
    fields: {
      patientId: uuid,
      anamnesis: { type: "string", maxLength: 100000, nullable: true },
    },
  },
  {
    path: "/api/records/entries",
    tag: "Prontuários",
    name: "Lançamento clínico",
    required: ["patientId", "type", "content"],
    fields: {
      patientId: uuid,
      appointmentId: { ...uuid, nullable: true },
      type: enumString("EVOLUTION", "PRESCRIPTION", "CERTIFICATE", "ADDENDUM"),
      content: boundedString(1, 100000),
      teeth: { type: "array", items: { type: "integer", minimum: 11, maximum: 48 } },
      addendumOfId: { ...uuid, nullable: true },
    },
  },
  {
    path: "/api/treatment-plans",
    tag: "Planos de tratamento",
    name: "Plano de tratamento",
    required: ["patientId"],
    fields: {
      patientId: uuid,
      status: enumString("DRAFT", "PRESENTED", "APPROVED", "IN_PROGRESS", "COMPLETED", "REJECTED"),
      totalCents: { type: "integer", minimum: 0 },
      approvedAt: { ...dateTime, nullable: true },
    },
  },
  {
    path: "/api/users",
    tag: "Usuários",
    name: "Usuário",
    required: [
      "brandName",
      "title",
      "subtitle",
      "fullName",
      "birthDate",
      "document",
      "phone",
      "email",
      "password",
      "termsLabel",
      "terms",
      "termsConjunction",
      "privacy",
      "submitLabel",
      "loginPrompt",
      "login",
      "copyright",
      "securityNote",
      "role",
    ],
    fields: {
      name: { ...boundedString(1, 160), description: "Opcional; fullName também define o nome." },
      brandName: boundedString(1, 160),
      title: boundedString(1, 500),
      subtitle: boundedString(1, 1000),
      fullName: boundedString(1, 160),
      birthDate: dateTime,
      document: boundedString(1, 255),
      phone: boundedString(1, 40),
      email: { type: "string", format: "email" },
      password: { type: "string", minLength: 12, maxLength: 128, writeOnly: true },
      termsLabel: boundedString(1, 500),
      terms: jsonObject,
      termsConjunction: boundedString(1, 160),
      privacy: jsonObject,
      submitLabel: boundedString(1, 160),
      loginPrompt: boundedString(1, 500),
      login: boundedString(1, 160),
      copyright: boundedString(1, 500),
      securityNote: boundedString(1, 1000),
      role: enumString("ADMIN", "DENTIST", "RECEPTION"),
      cro: { ...nullableString, maxLength: 40 },
      specialty: { ...nullableString, maxLength: 120 },
      color: { ...nullableString, maxLength: 20 },
      defaultSlotMinutes: { type: "integer", minimum: 5, maximum: 240, nullable: true },
      isActive: boolean,
    },
  },
  {
    path: "/api/whatsapp/templates",
    tag: "WhatsApp",
    name: "Template de WhatsApp",
    required: ["key", "body"],
    fields: {
      key: boundedString(1, 100),
      body: boundedString(1, 4000),
      isActive: boolean,
    },
  },
  {
    path: "/api/whatsapp/messages",
    tag: "WhatsApp",
    name: "Mensagem de WhatsApp",
    required: ["patientId", "direction", "body", "scheduledFor"],
    fields: {
      patientId: uuid,
      appointmentId: { ...uuid, nullable: true },
      campaignId: { ...uuid, nullable: true },
      direction: enumString("OUT", "IN"),
      templateKey: { ...nullableString, maxLength: 100 },
      body: boundedString(1, 4000),
      status: enumString("QUEUED", "SENT", "DELIVERED", "READ", "FAILED"),
      providerMessageId: { ...nullableString, maxLength: 255 },
      error: { ...nullableString, maxLength: 1000 },
      scheduledFor: dateTime,
      sentAt: { ...dateTime, nullable: true },
    },
  },
];

const jsonBody = (schema: Schema) => ({
  required: true,
  content: { "application/json": { schema } },
});

const response = (description: string, schema?: Schema) => ({
  description,
  ...(schema
    ? { content: { "application/json": { schema } } }
    : {}),
});

const resourcePaths: Record<string, Schema> = {};

for (const resource of resources) {
  const properties = resource.fields;
  const itemSchema: Schema = {
    type: "object",
    properties: {
      id: uuid,
      clinicId: uuid,
      ...properties,
    },
    additionalProperties: true,
  };
  const createSchema: Schema = {
    type: "object",
    properties,
    required: resource.required ?? [],
    additionalProperties: false,
  };
  const tag = [resource.tag];
  const collectionPath = resource.path;
  const itemPath = `${collectionPath}/{id}`;

  resourcePaths[collectionPath] = {
    get: {
      tags: tag,
      summary: `Lista ${resource.name.toLocaleLowerCase("pt-BR")}s`,
      parameters: [
        {
          name: "page",
          in: "query",
          schema: { type: "integer", minimum: 1, default: 1 },
        },
        {
          name: "pageSize",
          in: "query",
          schema: { type: "integer", minimum: 1, maximum: 100, default: 25 },
        },
      ],
      responses: {
        "200": response("Lista paginada", {
          type: "object",
          properties: {
            data: { type: "array", items: itemSchema },
            page: { type: "integer" },
            pageSize: { type: "integer" },
            total: { type: "integer" },
          },
        }),
        "401": response("Autenticação necessária"),
      },
    },
    ...(resource.readOnly
      ? {}
      : {
          post: {
            tags: tag,
            summary: `Cria ${resource.name.toLocaleLowerCase("pt-BR")}`,
            requestBody: jsonBody(createSchema),
            responses: {
              "201": response("Recurso criado", {
                type: "object",
                properties: { data: itemSchema },
              }),
              "400": response("Dados inválidos"),
              "401": response("Autenticação necessária"),
              "403": response("Permissão insuficiente"),
            },
          },
        }),
  };

  resourcePaths[itemPath] = {
    parameters: [
      {
        name: "id",
        in: "path",
        required: true,
        schema: uuid,
      },
    ],
    get: {
      tags: tag,
      summary: `Consulta ${resource.name.toLocaleLowerCase("pt-BR")} por ID`,
      responses: {
        "200": response("Recurso encontrado", {
          type: "object",
          properties: { data: itemSchema },
        }),
        "401": response("Autenticação necessária"),
        "404": response("Recurso não encontrado"),
      },
    },
    ...(resource.readOnly
      ? {}
      : {
          patch: {
            tags: tag,
            summary: `Atualiza ${resource.name.toLocaleLowerCase("pt-BR")}`,
            requestBody: jsonBody({
              ...createSchema,
              required: [],
              minProperties: 1,
            }),
            responses: {
              "200": response("Recurso atualizado", {
                type: "object",
                properties: { data: itemSchema },
              }),
              "400": response("Dados inválidos"),
              "401": response("Autenticação necessária"),
              "403": response("Permissão insuficiente"),
              "404": response("Recurso não encontrado"),
            },
          },
          delete: {
            tags: tag,
            summary: `Exclui ${resource.name.toLocaleLowerCase("pt-BR")}`,
            responses: {
              "204": response("Recurso excluído"),
              "401": response("Autenticação necessária"),
              "403": response("Permissão insuficiente"),
              "404": response("Recurso não encontrado"),
            },
          },
        }),
  };
}

export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Smile Sync API",
    version: "1.0.0",
    description:
      "Documentação dos endpoints de autenticação, clínicas e módulos do Smile Sync.",
  },
  servers: [{ url: "/" }],
  security: [{ bearerAuth: [] }],
  tags: [
    { name: "Health" },
    { name: "Autenticação" },
    ...[...new Set(resources.map((resource) => resource.tag))].map((name) => ({
      name,
    })),
    { name: "Dashboard" },
    { name: "Clínicas" },
  ],
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Verifica a disponibilidade da API",
        security: [],
        responses: {
          "200": response("API disponível", {
            type: "object",
            properties: { ok: boolean },
          }),
        },
      },
    },
    "/api/auth/register": {
      post: {
        tags: ["Autenticação"],
        summary: "Registra uma clínica e seu primeiro usuário",
        security: [],
        requestBody: jsonBody({
          type: "object",
          required: ["clinicName", "name", "email", "password"],
          properties: {
            clinicName: boundedString(2, 160),
            name: boundedString(2, 160),
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 12, maxLength: 128, writeOnly: true },
          },
          additionalProperties: false,
        }),
        responses: {
          "201": response("Clínica e usuário registrados", {
            type: "object",
            properties: {
              accessToken: string,
              user: {
                type: "object",
                properties: {
                  id: uuid,
                  clinicId: uuid,
                  name: string,
                  email: { type: "string", format: "email" },
                  role: enumString("OWNER"),
                },
              },
            },
          }),
          "400": response("Dados inválidos"),
          "429": response("Limite de tentativas excedido"),
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Autenticação"],
        summary: "Autentica um usuário",
        security: [],
        requestBody: jsonBody({
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 1, maxLength: 128, writeOnly: true },
          },
          additionalProperties: false,
        }),
        responses: {
          "200": response("Autenticação realizada", {
            type: "object",
            properties: {
              accessToken: string,
              user: {
                type: "object",
                properties: {
                  id: uuid,
                  clinicId: uuid,
                  name: string,
                  email: { type: "string", format: "email" },
                  role: enumString("OWNER", "ADMIN", "DENTIST", "RECEPTION"),
                },
              },
            },
          }),
          "400": response("Dados inválidos"),
          "401": response("Credenciais inválidas"),
          "429": response("Limite de tentativas excedido"),
        },
      },
    },
    "/api/auth/me": {
      get: {
        tags: ["Autenticação"],
        summary: "Retorna o usuário autenticado",
        responses: {
          "200": response("Dados do usuário autenticado", {
            type: "object",
            properties: {
              userId: uuid,
              clinicId: uuid,
              role: enumString("OWNER", "ADMIN", "DENTIST", "RECEPTION"),
            },
          }),
          "401": response("Autenticação necessária"),
        },
      },
    },
    "/api/clinics": {
      get: {
        tags: ["Clínicas"],
        summary: "Consulta a clínica atual",
        responses: {
          "200": response("Dados da clínica"),
          "401": response("Autenticação necessária"),
        },
      },
      patch: {
        tags: ["Clínicas"],
        summary: "Atualiza a clínica atual",
        requestBody: jsonBody({
          type: "object",
          minProperties: 1,
          additionalProperties: false,
          properties: {
            name: boundedString(2, 160),
            email: { type: "string", format: "email" },
            cnpj: { type: "string", maxLength: 18, nullable: true },
            phone: { type: "string", maxLength: 40, nullable: true },
            address: { ...jsonObject, nullable: true },
            timezone: boundedString(1, 80),
            slotMinutes: { type: "integer", minimum: 5, maximum: 240 },
            reminderHoursBefore: {
              type: "array",
              items: { type: "integer", minimum: 0, maximum: 720 },
              maxItems: 10,
            },
            whatsappEnabled: boolean,
            reactivationAfterDays: { type: "integer", minimum: 1, maximum: 3650 },
          },
        }),
        responses: {
          "200": response("Clínica atualizada"),
          "400": response("Dados inválidos"),
          "401": response("Autenticação necessária"),
          "403": response("Permissão insuficiente"),
        },
      },
    },
    "/api/dashboard/summary": {
      get: {
        tags: ["Dashboard"],
        summary: "Consulta o resumo do dashboard",
        parameters: [
          { name: "from", in: "query", schema: dateTime },
          { name: "to", in: "query", schema: dateTime },
        ],
        responses: {
          "200": response("Resumo do dashboard", {
            type: "object",
            properties: {
              data: {
                type: "object",
                properties: {
                  patients: {
                    type: "object",
                    properties: { active: integer, total: integer },
                  },
                  appointments: {
                    type: "object",
                    properties: { total: integer, completed: integer },
                  },
                  finance: {
                    type: "object",
                    properties: {
                      pendingAmountCents: integer,
                      overdue: integer,
                    },
                  },
                },
              },
            },
          }),
          "400": response("Parâmetros inválidos"),
          "401": response("Autenticação necessária"),
        },
      },
    },
    ...resourcePaths,
  },
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer" },
    },
  },
};
