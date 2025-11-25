const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  rawLog: { type: Object, required: true },
  ipReputation: { type: Object }, // Store full response from AbuseIPDB
  aiAnalysis: {
    severity: { type: String, enum: ["High", "Medium", "Low"], required: true },
    summary: { type: String },
    recommended_action: { type: String },
  },
  isRead: { type: Boolean, default: false },
  isResolved: { type: Boolean, default: false },
});

module.exports = mongoose.model("Alert", alertSchema);
