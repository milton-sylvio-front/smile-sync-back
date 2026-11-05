import { z } from "zod";
import type { ResourceDefinition } from "../crud";

export const appointmentsResource: ResourceDefinition = {
  table: "appointments",
  orderBy: "startAt",
  fields: {
    patientId: z.string().uuid(),
    professionalId: z.string().uuid(),
    startAt: z.coerce.date(),
    endAt: z.coerce.date(),
    status: z
      .enum([
        "SCHEDULED",
        "CONFIRMED",
        "CHECKED_IN",
        "IN_PROGRESS",
        "COMPLETED",
        "NO_SHOW",
        "CANCELLED",
      ])
      .optional(),
    confirmationStatus: z.enum(["PENDING", "CONFIRMED", "DECLINED"]).optional(),
    confirmedAt: z.coerce.date().nullable().optional(),
    confirmationChannel: z.string().max(100).nullable().optional(),
    notes: z.string().max(5000).nullable().optional(),
    source: z.enum(["MANUAL", "WHATSAPP", "ONLINE"]).optional(),
    cancelReason: z.string().max(1000).nullable().optional(),
  },
  relations: [
    { field: "patientId", table: "patients", activeOnly: true },
    { field: "professionalId", table: "users", activeOnly: true },
  ],
  prepare: async (data, context) => ({
    ...data,
    ...(context.operation === "create"
      ? { createdById: context.userId }
      : {}),
  }),
};
