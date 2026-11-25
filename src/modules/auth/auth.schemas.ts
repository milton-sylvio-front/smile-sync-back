import { z } from "zod";

export const registerSchema = z.strictObject({
  clinicName: z.string().trim().min(2).max(160).optional(),
  name: z.string().trim().min(2).max(160),
  email: z.email().toLowerCase(),
  birthDate: z.iso.date().optional(),
  document: z.string().trim().min(11).max(18),
  phone: z.string().trim().min(10).max(24),
  termsAccepted: z.literal(true),
  password: z
    .string()
    .min(8)
    .max(128)
    .regex(/[A-Z]/, "A senha deve incluir uma letra maiúscula.")
    .regex(/[0-9]/, "A senha deve incluir um número.")
    .regex(/[^A-Za-z0-9]/, "A senha deve incluir um caractere especial."),
});

export const loginSchema = z.strictObject({
  email: z.email().toLowerCase(),
  password: z.string().min(1).max(128),
});
