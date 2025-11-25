import express from "express";
import * as authController from "../controllers/authController";

const router = express.Router();

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post("/register", authController.register);

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post("/login", authController.login);

export default router;
