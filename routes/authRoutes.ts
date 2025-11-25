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

// @route   POST api/auth/refresh
// @desc    Refresh access token
// @access  Public
router.post("/refresh", authController.refresh);

// @route   POST api/auth/logout
// @desc    Logout user (revoke refresh token)
// @access  Public
router.post("/logout", authController.logout);

export default router;
