import { createResourceRouter } from "../crud";
import { appointmentsResource } from "./appointments.model";

export const appointmentsRoutes = createResourceRouter(appointmentsResource);
