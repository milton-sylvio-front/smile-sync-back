import { Router } from "express";
import { createResourceRouter } from "../crud";
import {
  clinicalEntriesResource,
  clinicalRecordsResource,
} from "./records.model";

const router = Router();
router.use("/entries", createResourceRouter(clinicalEntriesResource));
router.use("/", createResourceRouter(clinicalRecordsResource));

export { router as recordsRoutes };
