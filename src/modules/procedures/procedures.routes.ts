import { createResourceRouter } from "../crud";
import { proceduresResource } from "./procedures.model";

export const proceduresRoutes = createResourceRouter(proceduresResource);
