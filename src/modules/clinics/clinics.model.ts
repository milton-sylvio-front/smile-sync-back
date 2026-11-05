import { z } from "zod";
import type { ResourceDefinition } from "../crud";

export const businessHoursResource: ResourceDefinition = {
  table: "business_hours",
  orderBy: "weekday",
  fields: {
    weekday: z.number().int().min(0).max(6),
    startTime: z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/),
    endTime: z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/),
  },
  writeRoles: ["OWNER", "ADMIN"],
};
