import { z } from "zod";

export const legalDocumentSchema = z.record(z.string(), z.unknown());

export type LegalDocument = z.infer<typeof legalDocumentSchema>;
