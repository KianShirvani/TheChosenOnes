const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");

router.get("/", taskController.getTasks);
router.get("/filter", taskController.getFilteredTasks); // to filter the tasks based on the parameters
router.post("/", taskController.createTask);
router.put("/:taskId/move", taskController.moveTask);
router.put("/:taskId/lock", taskController.toggleLock);
router.put("/:taskId", taskController.updateTask);
router.delete("/:taskId", taskController.deleteTask);
// Get tasks assigned to a user
router.get("/assigned/:userId", taskController.getAssignedTasks);

// Update a specific assigned task
router.put("/assigned/:taskId", taskController.updateAssignedTask);

// Added router for the task assignment, get users, and remove users from tasks functionality
router.post("/:taskId/assign-users", taskController.assignUsersToTask);
router.get("/:taskId/users", taskController.getUsersForTask);
router.delete("/:taskId/remove-users", taskController.removeUsersFromTask);

module.exports = router;
