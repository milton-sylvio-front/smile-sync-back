import type { ResourceDefinition } from "../crud";

export const subscriptionResource: ResourceDefinition = {
  table: "subscriptions",
  readOnly: true,
  orderBy: "id",
  fields: {},
};
