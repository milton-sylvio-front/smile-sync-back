import { z } from "zod";

export const dashboardQuerySchema = z.strictObject({
  from: z.iso.datetime().optional(),
  to: z.iso.datetime().optional(),
});
