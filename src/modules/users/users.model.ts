import bcrypt from "bcrypt";
import { z } from "zod";
import { AppError } from "../../shared/errors/app-error";
import {
  decryptSensitiveText,
  encryptSensitiveText,
} from "../../shared/utils/crypto";
import type { ResourceDefinition } from "../crud";
import { legalDocumentSchema } from "./users.schemas";

export const usersResource: ResourceDefinition = {
  table: "users",
  softDelete: true,
  orderBy: "name",
  hiddenFields: ["passwordHash"],
  writeRoles: ["OWNER", "ADMIN"],
  fields: {
    name: z.string().trim().min(1).max(160).optional(),
    brandName: z.string().trim().min(1).max(160),
    title: z.string().trim().min(1).max(500),
    subtitle: z.string().trim().min(1).max(1000),
    fullName: z.string().trim().min(1).max(160),
    birthDate: z.coerce.date(),
    document: z.string().trim().min(1).max(255),
    phone: z.string().trim().min(1).max(40),
    email: z.string().trim().email().toLowerCase(),
    password: z.string().min(12).max(128),
    termsLabel: z.string().trim().min(1).max(500),
    terms: legalDocumentSchema,
    termsConjunction: z.string().trim().min(1).max(160),
    privacy: legalDocumentSchema,
    submitLabel: z.string().trim().min(1).max(160),
    loginPrompt: z.string().trim().min(1).max(500),
    login: z.string().trim().min(1).max(160),
    copyright: z.string().trim().min(1).max(500),
    securityNote: z.string().trim().min(1).max(1000),
    role: z.enum(["ADMIN", "DENTIST", "RECEPTION"]),
    cro: z.string().max(40).nullable().optional(),
    specialty: z.string().max(120).nullable().optional(),
    color: z.string().max(20).nullable().optional(),
    defaultSlotMinutes: z.number().int().min(5).max(240).nullable().optional(),
    isActive: z.boolean().optional(),
  },
  prepare: async (data, context) => {
    const { password, document, ...userData } = data;
    const fullName =
      typeof data.fullName === "string"
        ? data.fullName
        : typeof data.name === "string"
          ? data.name
          : undefined;
    if (
      context.operation === "create" &&
      fullName === undefined
    ) {
      throw new AppError("Informe o nome completo do usuário.", 400);
    }

    return {
      ...userData,
      ...(fullName !== undefined
        ? { name: fullName, fullName }
        : {}),
      ...(typeof document === "string"
        ? { document: encryptSensitiveText(document) }
        : document === null
          ? { document: null }
          : {}),
      ...(typeof password === "string"
        ? { passwordHash: await bcrypt.hash(password, 12) }
        : {}),
    };
  },
  present: (row) => ({
    ...row,
    document:
      typeof row.document === "string"
        ? decryptSensitiveText(row.document)
        : null,
  }),
};
