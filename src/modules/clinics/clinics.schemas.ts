import { z } from "zod";

export const updateClinicSchema = z
  .strictObject({
    name: z.string().trim().min(2).max(160).optional(),
    email: z.email().optional(),
    cnpj: z.string().max(18).nullable().optional(),
    phone: z.string().max(40).nullable().optional(),
    address: z.record(z.string(), z.unknown()).nullable().optional(),
    timezone: z.string().min(1).max(80).optional(),
    slotMinutes: z.number().int().min(5).max(240).optional(),
    reminderHoursBefore: z.array(z.number().int().min(0).max(720)).max(10).optional(),
    whatsappEnabled: z.boolean().optional(),
    reactivationAfterDays: z.number().int().min(1).max(3650).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "Informe ao menos um campo para atualizar.",
  });
