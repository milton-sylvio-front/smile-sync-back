import bcrypt from "bcrypt";
import { z } from "zod";
import type { ResourceDefinition } from "../crud";

export const usersResource: ResourceDefinition = {
  table: "users",
  softDelete: true,
  orderBy: "name",
  hiddenFields: ["passwordHash"],
  fields: {
    name: z.string().trim().min(1).max(160),
    email: z.email().toLowerCase(),
    password: z.string().min(12).max(128),
    role: z.enum(["ADMIN", "DENTIST", "RECEPTION"]),
    cro: z.string().max(40).nullable().optional(),
    specialty: z.string().max(120).nullable().optional(),
    color: z.string().max(20).nullable().optional(),
    defaultSlotMinutes: z.number().int().min(5).max(240).nullable().optional(),
    isActive: z.boolean().optional(),
  },
  prepare: async (data) => {
    const { password, ...userData } = data;
    return {
      ...userData,
      ...(typeof password === "string"
        ? { passwordHash: await bcrypt.hash(password, 12) }
        : {}),
    };
  },
};
