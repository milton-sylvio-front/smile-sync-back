import { Router } from "express";
import { createResourceRouter } from "../crud";
import { messagesResource, templatesResource } from "./whatsapp.model";

const router = Router();
router.use("/templates", createResourceRouter(templatesResource));
router.use("/messages", createResourceRouter(messagesResource));

export { router as whatsappRoutes };
