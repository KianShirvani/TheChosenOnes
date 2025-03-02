const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");

router.get("/", taskController.getTasks);
router.post("/", taskController.createTask);
router.put("/:taskId/move", taskController.moveTask);
router.put("/:taskId/lock", taskController.toggleLock);
router.put("/:taskId", taskController.updateTask);
router.delete("/:taskId", taskController.deleteTask);

module.exports = router;
