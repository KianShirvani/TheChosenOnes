const express = require("express");
const {
    promoteToAdmin,
    getAdminStats,
    getUsers,
    updateUser,
    deleteUser
} = require("../controllers/adminController");
const { validateAdmin } = require("../middlewares/validateAdmin");
const { authMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

// Get all users (only accessible by admins)
router.get("/users", authMiddleware, validateAdmin, getUsers);

// Promote user to admin route with validation middleware
router.post("/promote", validateAdmin, promoteToAdmin);

// Get admin statistics
router.get("/stats", validateAdmin, getAdminStats);

// Update user details (name, email)
router.put("/update/:id", authMiddleware, validateAdmin, updateUser);

// Delete a user
router.delete("/delete/:id", authMiddleware, validateAdmin, deleteUser);

module.exports = router;
