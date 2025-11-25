const express = require("express");
const router = express.Router();
const alertController = require("../controllers/alertController");
const auth = require("../middleware/authMiddleware");

// @route   POST api/alerts/audit
// @desc    Run a live security audit
// @access  Public (for now, or Protected if needed)
router.post("/audit", alertController.runAudit);

// @route   GET api/alerts/latest
// @desc    Get latest 10 alerts
// @access  Public
router.get("/latest", alertController.getLatestAlerts);

// @route   GET api/alerts/stats
// @desc    Get alert statistics
// @access  Public
router.get("/stats", alertController.getAlertStats);

// @route   GET api/alerts/history
// @desc    Get paginated alert history
// @access  Public
router.get("/history", alertController.getAlertHistory);

// @route   POST api/alerts
// @desc    Create a new alert manually
// @access  Protected
router.post("/", auth, alertController.createAlert);

// @route   PUT api/alerts/:id
// @desc    Update an alert
// @access  Protected
router.put("/:id", auth, alertController.updateAlert);

// @route   DELETE api/alerts/:id
// @desc    Delete an alert
// @access  Protected
router.delete("/:id", auth, alertController.deleteAlert);

module.exports = router;
