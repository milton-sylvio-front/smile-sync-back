import type { RequestHandler } from "express";
import { dashboardQuerySchema } from "./dashboard.schemas";
import { getDashboardSummary } from "./dashboard.service";

export const dashboardSummaryController: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const query = dashboardQuerySchema.parse(req.query);
    res.json({
      data: await getDashboardSummary(
        req.auth!.clinicId,
        query.from,
        query.to,
      ),
    });
  } catch (error) {
    next(error);
  }
};
