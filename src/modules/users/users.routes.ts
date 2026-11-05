import { createResourceRouter } from "../crud";
import { usersResource } from "./users.model";

export const usersRoutes = createResourceRouter(usersResource);
