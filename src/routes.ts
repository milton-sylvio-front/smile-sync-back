import { Router } from "express";
import { authorize } from "./shared/middlewares/authorize";
import { authenticate } from "./shared/middlewares/authenticate";
import { requireTenant } from "./shared/middlewares/tenant";
import { appointmentsRoutes } from "./modules/appointments/appointments.routes";
import { auditRoutes } from "./modules/audit/audit.routes";
import { authRoutes } from "./modules/auth/auth.routes";
import { billingRoutes } from "./modules/billing/billing.routes";
import { clinicsRoutes } from "./modules/clinics/clinics.routes";
import { dashboardRoutes } from "./modules/dashboard/dashboard.routes";
import { documentsRoutes } from "./modules/documents/documents.routes";
import { financeRoutes } from "./modules/finance/finance.routes";
import { patientsRoutes } from "./modules/patients/patients.routes";
import { proceduresRoutes } from "./modules/procedures/procedures.routes";
import { reactivationRoutes } from "./modules/reactivation/reactivation.routes";
import { recordsRoutes } from "./modules/records/records.routes";
import { treatmentPlansRoutes } from "./modules/treatment-plans/treatment-plans.routes";
import { usersRoutes } from "./modules/users/users.routes";
import { whatsappRoutes } from "./modules/whatsapp/whatsapp.routes";

export const routes = Router();

routes.use("/auth", authRoutes);
routes.use(authenticate, requireTenant);
routes.use("/clinics", clinicsRoutes);
routes.use("/appointments", appointmentsRoutes);
routes.use("/audit", authorize("OWNER", "ADMIN"), auditRoutes);
routes.use("/billing", authorize("OWNER"), billingRoutes);
routes.use("/dashboard", dashboardRoutes);
routes.use("/documents", documentsRoutes);
routes.use(
  "/finance",
  authorize("OWNER", "ADMIN", "RECEPTION"),
  financeRoutes,
);
routes.use("/patients", patientsRoutes);
routes.use("/procedures", proceduresRoutes);
routes.use(
  "/reactivation",
  authorize("OWNER", "ADMIN"),
  reactivationRoutes,
);
routes.use("/records", authorize("OWNER", "ADMIN", "DENTIST"), recordsRoutes);
routes.use(
  "/treatment-plans",
  authorize("OWNER", "ADMIN", "DENTIST"),
  treatmentPlansRoutes,
);
routes.use("/users", authorize("OWNER", "ADMIN"), usersRoutes);
routes.use(
  "/whatsapp",
  authorize("OWNER", "ADMIN", "RECEPTION"),
  whatsappRoutes,
);