import express from "express";
import * as settingsController from "../controllers/settingsController";
import protect from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", protect, settingsController.getSettings);
router.put("/", protect, settingsController.updateSettings);

export default router;
