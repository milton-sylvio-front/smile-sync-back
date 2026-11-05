import { z } from "zod";
import type { ResourceDefinition } from "../crud";

export const patientsResource: ResourceDefinition = {
  table: "patients",
  softDelete: true,
  orderBy: "name",
  fields: {
    name: z.string().trim().min(1).max(160),
    birthDate: z.coerce.date().nullable().optional(),
    sex: z.enum(["M", "F", "O"]).nullable().optional(),
    phone: z.string().max(40).nullable().optional(),
    whatsapp: z.string().max(40).nullable().optional(),
    email: z.email().nullable().optional(),
    address: z.record(z.string(), z.unknown()).nullable().optional(),
    guardianName: z.string().max(160).nullable().optional(),
    guardianPhone: z.string().max(40).nullable().optional(),
    guardianRelationship: z.string().max(80).nullable().optional(),
    insuranceName: z.string().max(160).nullable().optional(),
    insuranceCard: z.string().max(100).nullable().optional(),
    status: z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]).optional(),
    tags: z.array(z.string().max(60)).max(30).optional(),
  },
  writeRoles: ["OWNER", "ADMIN", "DENTIST", "RECEPTION"],
  prepare: async (data) => ({
    ...data,
    ...(typeof data.name === "string"
      ? {
          nameNormalized: data.name
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLocaleLowerCase("pt-BR")
            .trim(),
        }
      : {}),
  }),
};
