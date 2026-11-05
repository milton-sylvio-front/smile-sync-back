import { z } from "zod";
import type { ResourceDefinition } from "../crud";

export const campaignsResource: ResourceDefinition = {
  table: "reactivation_campaigns",
  orderBy: "createdAt",
  fields: {
    name: z.string().trim().min(1).max(160),
    inactiveDays: z.number().int().positive().max(3650),
    tags: z.array(z.string().max(60)).max(30).optional(),
    strategy: z.enum(["AI", "TEMPLATE"]).optional(),
    status: z.enum(["DRAFT", "RUNNING", "FINISHED"]).optional(),
  },
};
