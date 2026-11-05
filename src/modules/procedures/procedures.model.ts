import { z } from "zod";
import type { ResourceDefinition } from "../crud";

export const proceduresResource: ResourceDefinition = {
  table: "procedures",
  orderBy: "name",
  fields: {
    name: z.string().trim().min(1).max(160),
    code: z.string().max(40).nullable().optional(),
    category: z.string().max(100).nullable().optional(),
    priceCents: z.number().int().min(0),
    durationMinutes: z.number().int().min(1).max(1440).optional(),
    isActive: z.boolean().optional(),
  },
  writeRoles: ["OWNER", "ADMIN"],
};
