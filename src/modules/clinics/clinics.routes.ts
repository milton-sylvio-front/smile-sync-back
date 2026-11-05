import { Router } from "express";
import { authorize } from "../../shared/middlewares/authorize";
import { validateBody } from "../../shared/middlewares/validate";
import { createResourceRouter } from "../crud";
import { getClinicController, updateClinicController } from "./clinics.controller";
import { businessHoursResource } from "./clinics.model";
import { updateClinicSchema } from "./clinics.schemas";

const router = Router();
router.use("/business-hours", createResourceRouter(businessHoursResource));
router.get("/", getClinicController);
router.patch(
  "/",
  authorize("OWNER", "ADMIN"),
  validateBody(updateClinicSchema),
  updateClinicController,
);

export { router as clinicsRoutes };
