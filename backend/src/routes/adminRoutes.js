const express = require("express");
const {
    promoteToAdmin,
    getAdminStats,
    getUsers,
    updateUser,
    deleteUser,
    demoteAdmin
} = require("../controllers/adminController");
const { authenticatedUser } = require("../middlewares/authMiddleware"); // authenticatedUser must use before validateAdmin 
const { validateAdmin } = require("../middlewares/validateAdmin");


const router = express.Router();

// Get all users (only accessible by admins)
router.get("/users", authenticatedUser, validateAdmin, getUsers);

// Promote user to admin route with validation middleware
router.post("/promote", authenticatedUser, validateAdmin, promoteToAdmin);// add authenticatedUser to ensure that the token is resolved

// Demote endpoint for admin users.
router.post("/demote", authenticatedUser, validateAdmin, demoteAdmin);

// Get admin statistics
router.get("/stats", validateAdmin, getAdminStats);

// Update user details (name, email)
router.put("/update/:id", authenticatedUser, validateAdmin, updateUser);

// Delete a user
router.delete("/delete/:id", authenticatedUser, validateAdmin, deleteUser);

module.exports = router;
