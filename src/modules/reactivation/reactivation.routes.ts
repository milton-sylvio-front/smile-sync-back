import { Router } from "express";
import { createResourceRouter } from "../crud";
import { campaignsResource } from "./reactivation.model";

const router = Router();
router.use("/campaigns", createResourceRouter(campaignsResource));

export { router as reactivationRoutes };
