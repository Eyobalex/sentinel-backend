require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const alertRoutes = require("./routes/alertRoutes");
const userRoutes = require("./routes/userRoutes");
const healthRoutes = require("./routes/healthRoutes");
const cronService = require("./services/cronService");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// --- Configuration ---
const PORT = process.env.PORT || 8080;
const MONGO_URI = process.env.MONGO_URI;

// --- Database Connection ---
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB Atlas");
    // Initialize Cron Jobs after DB connection
    cronService.initCronJobs();
  })
  .catch((err) => console.error("MongoDB connection error:", err));

// --- Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/alerts", alertRoutes); // Note: frontend calls /api/run-audit, now it will be /api/alerts/audit
app.use("/api/users", userRoutes);
app.use("/api/health", healthRoutes);

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Sentinel Agent running on port ${PORT}`);
});
