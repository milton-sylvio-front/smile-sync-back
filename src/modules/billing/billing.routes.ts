import { createResourceRouter } from "../crud";
import { subscriptionResource } from "./billing.model";

export const billingRoutes = createResourceRouter(subscriptionResource);
