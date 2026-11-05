import { createResourceRouter } from "../crud";
import { documentsResource } from "./documents.model";

export const documentsRoutes = createResourceRouter(documentsResource);
