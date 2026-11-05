import { z } from "zod";
import type { ResourceDefinition } from "../crud";
import {
  decryptSensitiveText,
  encryptSensitiveText,
} from "../../shared/utils/crypto";

export const clinicalRecordsResource: ResourceDefinition = {
  table: "clinical_records",
  orderBy: "updatedAt",
  hiddenFields: ["anamnesisEncrypted"],
  fields: {
    patientId: z.string().uuid(),
    anamnesis: z.string().max(100_000).nullable().optional(),
  },
  relations: [{ field: "patientId", table: "patients", activeOnly: true }],
  prepare: async (data, context) => {
    const { anamnesis, ...otherData } = data;
    return {
      ...otherData,
      ...(typeof anamnesis === "string"
        ? { anamnesisEncrypted: encryptSensitiveText(anamnesis) }
        : anamnesis === null
          ? { anamnesisEncrypted: null }
          : {}),
      updatedById: context.userId,
    };
  },
  present: (row) => ({
    ...row,
    anamnesis:
      typeof row.anamnesisEncrypted === "string"
        ? decryptSensitiveText(row.anamnesisEncrypted)
        : null,
  }),
};

export const clinicalEntriesResource: ResourceDefinition = {
  table: "clinical_entries",
  orderBy: "createdAt",
  mutableFilter: '"signedAt" IS NULL',
  hiddenFields: ["contentEncrypted"],
  fields: {
    patientId: z.string().uuid(),
    appointmentId: z.string().uuid().nullable().optional(),
    type: z.enum(["EVOLUTION", "PRESCRIPTION", "CERTIFICATE", "ADDENDUM"]),
    content: z.string().min(1).max(100_000),
    teeth: z.array(z.number().int().min(11).max(48)).optional(),
    addendumOfId: z.string().uuid().nullable().optional(),
  },
  relations: [
    { field: "patientId", table: "patients", activeOnly: true },
    { field: "appointmentId", table: "appointments" },
    { field: "addendumOfId", table: "clinical_entries" },
  ],
  prepare: async (data, context) => {
    const { content, ...otherData } = data;
    return {
      ...otherData,
      ...(typeof content === "string"
        ? { contentEncrypted: encryptSensitiveText(content) }
        : {}),
      ...(context.operation === "create"
        ? { professionalId: context.userId }
        : {}),
    };
  },
  present: (row) => ({
    ...row,
    content:
      typeof row.contentEncrypted === "string"
        ? decryptSensitiveText(row.contentEncrypted)
        : null,
  }),
};
