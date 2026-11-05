import { Router } from "express";
import { createResourceRouter } from "../crud";
import {
  financeCategoriesResource,
  transactionsResource,
} from "./finance.model";

const router = Router();
router.use("/categories", createResourceRouter(financeCategoriesResource));
router.use("/transactions", createResourceRouter(transactionsResource));

export { router as financeRoutes };
