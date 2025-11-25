import express, { Application } from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import alertRoutes from "./routes/alertRoutes";
import userRoutes from "./routes/userRoutes";
import healthRoutes from "./routes/healthRoutes";
import * as cronService from "./services/cronService";

dotenv.config();

const app: Application = express();

// Middleware
app.use(express.json());
app.use(cors());

// --- Configuration ---
const PORT = process.env.PORT || 8080;
const MONGO_URI = process.env.MONGO_URI || "";

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
app.use("/api/alerts", alertRoutes);
app.use("/api/users", userRoutes);
app.use("/api/health", healthRoutes);

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Sentinel Backend running on port ${PORT}`);
});
