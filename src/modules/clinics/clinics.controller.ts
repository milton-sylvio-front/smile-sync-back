import type { RequestHandler } from "express";
import { getClinic, updateClinic } from "./clinics.service";

export const getClinicController: RequestHandler = async (req, res, next) => {
  try {
    res.json({ data: await getClinic(req.auth!.clinicId) });
  } catch (error) {
    next(error);
  }
};

export const updateClinicController: RequestHandler = async (req, res, next) => {
  try {
    res.json({
      data: await updateClinic(req.auth!.clinicId, req.body),
    });
  } catch (error) {
    next(error);
  }
};
