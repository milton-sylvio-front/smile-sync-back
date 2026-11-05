import { createResourceRouter } from "../crud";
import { treatmentPlansResource } from "./treatment-plans.model";

export const treatmentPlansRoutes = createResourceRouter(treatmentPlansResource);
