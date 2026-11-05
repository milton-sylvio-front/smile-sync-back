import { z } from "zod";
import type { ResourceDefinition } from "../crud";

export const documentsResource: ResourceDefinition = {
  table: "documents",
  orderBy: "createdAt",
  fields: {
    patientId: z.string().uuid(),
    kind: z.enum(["XRAY", "PHOTO", "EXAM", "CONSENT_FORM", "CONTRACT", "OTHER"]),
    fileName: z.string().trim().min(1).max(255),
    mimeType: z.string().min(1).max(160),
    sizeBytes: z.number().int().positive(),
    storageKey: z.string().min(1).max(1024),
  },
  relations: [{ field: "patientId", table: "patients", activeOnly: true }],
  prepare: async (data, context) => ({
    ...data,
    ...(context.operation === "create"
      ? { uploadedById: context.userId }
      : {}),
  }),
};
