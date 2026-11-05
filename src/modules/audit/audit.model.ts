import type { ResourceDefinition } from "../crud";

export const auditResource: ResourceDefinition = {
  table: "audit_logs",
  readOnly: true,
  orderBy: "createdAt",
  fields: {},
};
