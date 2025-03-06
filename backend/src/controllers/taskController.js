// dependencies
const { Client } = require("pg");

// set up connection to the database
const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: false
});

// to prevent connecting to the database during tests
if (process.env.NODE_ENV !== "test") {
    client.connect();
}

// ✅ Get all tasks
// ✅ define getTasks at the top
const getTasks = async (req, res) => {
  try {
    const result = await client.query("SELECT * FROM tasks");

    if (!result || !result.rows) {
      console.error("Error in getTasks: No rows returned.");
      return res.status(500).json({ message: "Server error" });
    }

    res.status(200).json({ todo: result.rows });
  } catch (error) {
    console.error("Error in getTasks:", error);
    res.status(500).json({ message: "Server error", error });
  }
};




// ✅ Create a new task
const createTask = async (req, res) => {
  try {
    console.log("🔹 Received task data:", req.body); 

    const { kanban_id, user_id, title, description, priority, due_date, status } = req.body;

    if (!title || !description || !priority || !due_date || !kanban_id || !user_id) {
      console.log("❌ Missing required fields:", req.body);
      return res.status(400).json({ message: "All fields except status are required" });
    }

    const result = await client.query(
      "INSERT INTO tasks (kanban_id, user_id, title, description, priority, due_date, status, locked) VALUES ($1, $2, $3, $4, $5, $6, $7, false) RETURNING *",
      [kanban_id, user_id, title, description, priority, due_date, status]
    );

    if (!result || !result.rows || result.rows.length === 0) {
      console.error("❌ Error: Task was not created.");
      return res.status(500).json({ message: "Task creation failed" });
    }

    console.log("✅ Task created:", result.rows[0]);
    res.status(201).json({ message: "Task created successfully", task: result.rows[0] });
  } catch (error) {
    console.error("❌ Error in createTask:", error.message, "\nQuery Error Details:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



// ✅ Toggle task lock/unlock
const toggleLock = async (req, res) => {
  try {
    const { taskId } = req.params;

    const taskCheck = await client.query("SELECT locked FROM tasks WHERE task_id = $1", [taskId]);

if (taskCheck.rowCount === 0 || !taskCheck.rows[0]) {  // ✅ fix: return 404 instead of 500
  return res.status(404).json({ message: "Task not found" });
}


  const newLockStatus = !taskCheck.rows[0].locked;

    const updatedTask = await client.query(
      "UPDATE tasks SET locked = $1 WHERE task_id = $2 RETURNING *",
      [newLockStatus, taskId]
    );

    res.status(200).json({ message: `Task lock status updated to ${newLockStatus}`, task: updatedTask.rows[0] });
  } catch (error) {
    console.error("Error in toggleLock:", error);
    res.status(500).json({ message: "Server error", error });
  }
};



// ✅ Move a task
const moveTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { direction } = req.body;

    const columnOrder = ["todo", "inProgress", "done"];

    const taskResult = await client.query("SELECT * FROM tasks WHERE task_id = $1", [taskId]);
    if (taskResult.rowCount === 0) return res.status(404).json({ message: "Task not found" });

    const task = taskResult.rows[0];
    if (task.locked) return res.status(403).json({ message: "Task is locked and cannot be moved" });

    const currentIndex = columnOrder.indexOf(task.status);
    const newIndex = direction === "left" ? currentIndex - 1 : currentIndex + 1;

    if (newIndex < 0 || newIndex >= columnOrder.length) {
      return res.status(400).json({ message: "Cannot move task further" });
    }

    const updatedTask = await client.query(
      "UPDATE tasks SET status = $1 WHERE task_id = $2 RETURNING *",
      [columnOrder[newIndex], taskId]
    );

    res.status(200).json({ message: "Task moved successfully", task: updatedTask.rows[0] });
  } catch (error) {
    console.error("Error in moveTask:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// ✅ Update a task
const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, description, priority, due_date, status } = req.body;

    const taskCheck = await client.query("SELECT locked FROM tasks WHERE task_id = $1", [taskId]);

    // ✅ Fix: Prevent accessing 'locked' on undefined rows
    if (!taskCheck || taskCheck.rowCount === 0 || !taskCheck.rows[0]) {  
      console.error(`❌ Task with ID ${taskId} not found.`);
      return res.status(404).json({ message: "Task not found" });
    }

    if (taskCheck.rows[0].locked) {
      return res.status(403).json({ message: "Task is locked and cannot be edited" });
    }

    const result = await client.query(
      "UPDATE tasks SET title = COALESCE($1, title), description = COALESCE($2, description), priority = COALESCE($3, priority), due_date = COALESCE($4, due_date), status = COALESCE($5, status) WHERE task_id = $6 RETURNING *",
      [title, description, priority, due_date, status, taskId]
    );

    if (!result || result.rowCount === 0) {
      return res.status(500).json({ message: "Failed to update task" });
    }

    console.log(`✅ Task ${taskId} updated.`);
    res.status(200).json({ message: "Task updated successfully", task: result.rows[0] });
  } catch (error) {
    console.error("❌ Error in updateTask:", error);
    res.status(500).json({ message: "Server error", error });
  }
};




const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const result = await client.query("DELETE FROM tasks WHERE task_id = $1 RETURNING *", [taskId]);

    if (result.rowCount === 0) {  // ✅ Fix: return 404 if no task was deleted
      console.log(`❌ Task with ID ${taskId} not found.`);
      return res.status(404).json({ message: "Task not found" });
    }

    console.log(`✅ Task ${taskId} deleted.`);
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("❌ Error in deleteTask:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};




// ✅ make sure it's included in module.exports
module.exports = { getTasks, createTask, toggleLock, moveTask, updateTask, deleteTask };

