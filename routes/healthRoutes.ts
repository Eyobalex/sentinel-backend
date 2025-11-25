import express, { Request, Response } from "express";

const router = express.Router();

// @route   GET api/health
// @desc    Check system status
// @access  Public
router.get("/", (req: Request, res: Response) => {
  res.status(200).json({ status: "OK", timestamp: new Date() });
});

export default router;
