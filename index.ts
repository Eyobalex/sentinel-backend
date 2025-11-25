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
app.use(
  cors({
    origin: "*", // Allow ALL requests (easiest for testing)
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// --- Configuration ---
const PORT = process.env.PORT || 8080;
const MONGO_URI = process.env.MONGO_URI || "";

// --- Database Connection ---
// --- Database Connection ---
const connectDB = async (retries = 10, delay = 10000) => {
  for (let i = 0; i < retries; i++) {
    try {
      await mongoose.connect(MONGO_URI);
      console.log("Connected to MongoDB Atlas");
      // Initialize Cron Jobs after DB connection
      cronService.initCronJobs();
      return;
    } catch (err) {
      console.error(
        `MongoDB connection error (Attempt ${i + 1}/${retries}):`,
        err
      );
      if (i < retries - 1) {
        console.log(`Retrying in ${delay / 1000} seconds...`);
        await new Promise((res) => setTimeout(res, delay));
      } else {
        console.error(
          "Failed to connect to MongoDB after multiple attempts. Exiting."
        );
        process.exit(1);
      }
    }
  }
};

connectDB();

// --- Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/users", userRoutes);
app.use("/api/health", healthRoutes);

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Sentinel Backend running on port ${PORT}`);
});
