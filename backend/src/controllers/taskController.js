const db = require("../database/db"); // ✅ Import database connection

// ✅ Get all tasks
exports.getTasks = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM tasks");
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

// ✅ Create a new task
exports.createTask = async (req, res) => {
  try {
    const { kanban_id, user_id, title, description, priority, due_date, status } = req.body;

    if (!title || !description || !priority || !due_date || !kanban_id || !user_id) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const result = await db.query(
      "INSERT INTO tasks (kanban_id, user_id, title, description, priority, due_date, status, locked) VALUES ($1, $2, $3, $4, $5, $6, $7, false) RETURNING *",
      [kanban_id, user_id, title, description, priority, due_date, status]
    );

    res.status(201).json({ message: "Task created successfully", task: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

// ✅ Toggle task lock/unlock
exports.toggleLock = async (req, res) => {
  try {
    const { taskId } = req.params;

    // Check if task exists
    const taskResult = await db.query("SELECT locked FROM tasks WHERE task_id = $1", [taskId]);
    if (taskResult.rowCount === 0) return res.status(404).json({ message: "Task not found" });

    // Toggle lock state
    const newLockStatus = !taskResult.rows[0].locked;
    const updatedTask = await db.query(
      "UPDATE tasks SET locked = $1 WHERE task_id = $2 RETURNING *",
      [newLockStatus, taskId]
    );

    res.status(200).json({ message: `Task lock status updated to ${newLockStatus}`, task: updatedTask.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

// ✅ Move a task
exports.moveTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { direction } = req.body;

    const columnOrder = ["todo", "inProgress", "done"];

    const taskResult = await db.query("SELECT * FROM tasks WHERE task_id = $1", [taskId]);
    if (taskResult.rowCount === 0) return res.status(404).json({ message: "Task not found" });

    const task = taskResult.rows[0];
    if (task.locked) return res.status(403).json({ message: "Task is locked and cannot be moved" });

    const currentIndex = columnOrder.indexOf(task.status);
    const newIndex = direction === "left" ? currentIndex - 1 : currentIndex + 1;

    if (newIndex < 0 || newIndex >= columnOrder.length) {
      return res.status(400).json({ message: "Cannot move task further" });
    }

    const updatedTask = await db.query(
      "UPDATE tasks SET status = $1 WHERE task_id = $2 RETURNING *",
      [columnOrder[newIndex], taskId]
    );

    res.status(200).json({ message: "Task moved successfully", task: updatedTask.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

// ✅ Update a task
exports.updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, description, priority, due_date, status } = req.body;

    const taskCheck = await db.query("SELECT locked FROM tasks WHERE task_id = $1", [taskId]);
    if (taskCheck.rowCount === 0) return res.status(404).json({ message: "Task not found" });

    if (taskCheck.rows[0].locked) return res.status(403).json({ message: "Task is locked and cannot be edited" });

    const result = await db.query(
      "UPDATE tasks SET title = COALESCE($1, title), description = COALESCE($2, description), priority = COALESCE($3, priority), due_date = COALESCE($4, due_date), status = COALESCE($5, status) WHERE task_id = $6 RETURNING *",
      [title, description, priority, due_date, status, taskId]
    );

    res.status(200).json({ message: "Task updated successfully", task: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

// ✅ Delete a task
exports.deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const result = await db.query("DELETE FROM tasks WHERE task_id = $1 RETURNING *", [taskId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};
