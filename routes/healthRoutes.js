const express = require("express");
const router = express.Router();

// @route   GET api/health
// @desc    Check system status
// @access  Public
router.get("/", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date() });
});

module.exports = router;
