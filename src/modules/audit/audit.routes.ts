import { createResourceRouter } from "../crud";
import { auditResource } from "./audit.model";

export const auditRoutes = createResourceRouter(auditResource);
