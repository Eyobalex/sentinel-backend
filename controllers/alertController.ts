import { Request, Response } from "express";
import * as alertService from "../services/alertService";

export const runAudit = async (req: Request, res: Response) => {
  try {
    const newAlert = await alertService.performAudit();
    res.status(200).json({ message: "Audit complete", data: newAlert });
  } catch (error: any) {
    console.error("Audit failed:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
};

export const getLatestAlerts = async (req: Request, res: Response) => {
  try {
    const alerts = await alertService.getLatestAlerts();
    res.json(alerts);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getAlertHistory = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const filters = {
      severity: req.query.severity as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
    };

    const result = await alertService.getAlertHistory(page, limit, filters);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getAlertStats = async (req: Request, res: Response) => {
  try {
    const stats = await alertService.getAlertStats();
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const createAlert = async (req: Request, res: Response) => {
  try {
    const newAlert = await alertService.createAlert(req.body);
    res.status(201).json(newAlert);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const updateAlert = async (req: Request, res: Response) => {
  try {
    const updatedAlert = await alertService.updateAlert(
      req.params.id,
      req.body
    );
    res.json(updatedAlert);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteAlert = async (req: Request, res: Response) => {
  try {
    await alertService.deleteAlert(req.params.id);
    res.json({ message: "Alert deleted" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
