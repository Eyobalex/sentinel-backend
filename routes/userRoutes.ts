import express from "express";
import * as userController from "../controllers/userController";
import auth from "../middleware/authMiddleware";

const router = express.Router();

// @route   GET api/users
// @desc    Get all users
// @access  Protected
router.get("/", auth, userController.getAllUsers);

// @route   POST api/users
// @desc    Create a user
// @access  Protected
router.post("/", auth, userController.createUser);

// @route   DELETE api/users/:id
// @desc    Delete a user
// @access  Protected
router.delete("/:id", auth, userController.deleteUser);

export default router;
