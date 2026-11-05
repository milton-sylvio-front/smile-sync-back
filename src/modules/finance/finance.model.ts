import { z } from "zod";
import type { ResourceDefinition } from "../crud";

export const transactionsResource: ResourceDefinition = {
  table: "transactions",
  orderBy: "dueDate",
  fields: {
    type: z.enum(["INCOME", "EXPENSE"]),
    categoryId: z.string().uuid(),
    description: z.string().trim().min(1).max(500),
    amountCents: z.number().int().positive(),
    dueDate: z.coerce.date(),
    paidAt: z.coerce.date().nullable().optional(),
    status: z.enum(["PENDING", "PAID", "OVERDUE", "CANCELLED"]).optional(),
    method: z.enum(["PIX", "CARD", "CASH", "BOLETO", "TRANSFER"]).nullable().optional(),
    patientId: z.string().uuid().nullable().optional(),
    appointmentId: z.string().uuid().nullable().optional(),
    treatmentPlanId: z.string().uuid().nullable().optional(),
    installmentNumber: z.number().int().positive().nullable().optional(),
    installmentTotal: z.number().int().positive().nullable().optional(),
    installmentGroupId: z.string().uuid().nullable().optional(),
  },
  relations: [
    { field: "categoryId", table: "finance_categories" },
    { field: "patientId", table: "patients", activeOnly: true },
    { field: "appointmentId", table: "appointments" },
    { field: "treatmentPlanId", table: "treatment_plans" },
  ],
  prepare: async (data, context) => ({
    ...data,
    ...(context.operation === "create"
      ? { createdById: context.userId }
      : {}),
  }),
  writeRoles: ["OWNER", "ADMIN"],
};

export const financeCategoriesResource: ResourceDefinition = {
  table: "finance_categories",
  orderBy: "name",
  fields: {
    name: z.string().trim().min(1).max(100),
    type: z.enum(["INCOME", "EXPENSE"]),
  },
  writeRoles: ["OWNER", "ADMIN"],
};
