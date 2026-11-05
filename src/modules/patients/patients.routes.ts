import { createResourceRouter } from "../crud";
import { patientsResource } from "./patients.model";

export const patientsRoutes = createResourceRouter(patientsResource);
