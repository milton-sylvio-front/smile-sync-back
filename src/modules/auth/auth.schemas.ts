import { z } from "zod";

export const registerSchema = z.strictObject({
  clinicName: z.string().trim().min(2).max(160),
  name: z.string().trim().min(2).max(160),
  email: z.email().toLowerCase(),
  password: z.string().min(12).max(128),
});

export const loginSchema = z.strictObject({
  email: z.email().toLowerCase(),
  password: z.string().min(1).max(128),
});
