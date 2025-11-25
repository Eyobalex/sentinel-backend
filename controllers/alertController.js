const Alert = require("../models/Alert");
const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { Resend } = require("resend");
const alertService = require("../services/alertService");

// Initialize Clients
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

// Controller Methods
exports.runAudit = async (req, res) => {
  try {
    const newAlert = await alertService.performAudit();
    res.status(200).json({ message: "Audit complete", data: newAlert });
  } catch (error) {
    console.error("Audit failed:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
};

exports.getLatestAlerts = async (req, res) => {
  try {
    const alerts = await alertService.getLatestAlerts();
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAlertHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const filters = {
      severity: req.query.severity,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };

    const result = await alertService.getAlertHistory(page, limit, filters);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAlertStats = async (req, res) => {
  try {
    const stats = await alertService.getAlertStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createAlert = async (req, res) => {
  try {
    const newAlert = await alertService.createAlert(req.body);
    res.status(201).json(newAlert);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateAlert = async (req, res) => {
  try {
    const updatedAlert = await alertService.updateAlert(
      req.params.id,
      req.body
    );
    res.json(updatedAlert);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteAlert = async (req, res) => {
  try {
    await alertService.deleteAlert(req.params.id);
    res.json({ message: "Alert deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
