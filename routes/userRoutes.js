const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const auth = require("../middleware/authMiddleware");

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

module.exports = router;
