import { z } from "zod";
import type { ResourceDefinition } from "../crud";

export const treatmentPlansResource: ResourceDefinition = {
  table: "treatment_plans",
  orderBy: "createdAt",
  fields: {
    patientId: z.string().uuid(),
    status: z
      .enum(["DRAFT", "PRESENTED", "APPROVED", "IN_PROGRESS", "COMPLETED", "REJECTED"])
      .optional(),
    totalCents: z.number().int().min(0).optional(),
    approvedAt: z.coerce.date().nullable().optional(),
  },
  relations: [{ field: "patientId", table: "patients", activeOnly: true }],
  prepare: async (data, context) => ({
    ...data,
    ...(context.operation === "create"
      ? { professionalId: context.userId }
      : {}),
  }),
};
