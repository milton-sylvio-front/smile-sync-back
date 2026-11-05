import { z } from "zod";
import type { ResourceDefinition } from "../crud";

export const templatesResource: ResourceDefinition = {
  table: "whatsapp_templates",
  orderBy: "key",
  fields: {
    key: z.string().trim().min(1).max(100),
    body: z.string().trim().min(1).max(4000),
    isActive: z.boolean().optional(),
  },
};

export const messagesResource: ResourceDefinition = {
  table: "whatsapp_messages",
  orderBy: "scheduledFor",
  fields: {
    patientId: z.string().uuid(),
    appointmentId: z.string().uuid().nullable().optional(),
    campaignId: z.string().uuid().nullable().optional(),
    direction: z.enum(["OUT", "IN"]),
    templateKey: z.string().max(100).nullable().optional(),
    body: z.string().trim().min(1).max(4000),
    status: z.enum(["QUEUED", "SENT", "DELIVERED", "READ", "FAILED"]).optional(),
    providerMessageId: z.string().max(255).nullable().optional(),
    error: z.string().max(1000).nullable().optional(),
    scheduledFor: z.coerce.date(),
    sentAt: z.coerce.date().nullable().optional(),
  },
  relations: [
    { field: "patientId", table: "patients" },
    { field: "appointmentId", table: "appointments" },
    { field: "campaignId", table: "reactivation_campaigns" },
  ],
};
