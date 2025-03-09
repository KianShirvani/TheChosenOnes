// dependencies
const { Client } = require("pg");
const moment = require('moment');

// set up connection to the database
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

// to prevent connecting to the database during tests
if (process.env.NODE_ENV !== "test") {
  client.connect();
}


// Get all tasks
const getTasks = async (req, res) => {
  try {
    const result = await client.query("SELECT * FROM tasks");

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "No tasks found." });
    }

    res.status(200).json({ tasks: result.rows });
  } catch (error) {
    console.error("Error in getTasks:", error);
    res.status(500).json({ message: "Server error", error });
  }
};


// Create a new task
const createTask = async (req, res) => {
  try {
    const { kanban_id, user_id, title, description, priority, due_date, start_date, end_date, progress, status } = req.body;

    if (!title || !description || !progress || !due_date || !start_date || !end_date ) {
      console.log("Missing required fields:", req.body);
      return res.status(400).json({ message: "All fields except status are required" });
    }

    const result = await client.query(
      "INSERT INTO tasks (kanban_id, user_id, title, description, priority, due_date, status, locked) VALUES ($1, $2, $3, $4, $5, $6, $7, false) RETURNING *",
      [kanban_id, user_id, title, description, priority, moment(due_date).format('YYYY-MM-DD'), status]
    );

    if (!result || !result.rows || result.rows.length === 0) {
      console.error("Error: Task was not created.");
      return res.status(500).json({ message: "Task creation failed" });
    }

    console.log("Task created:", result.rows[0]);
    res.status(201).json({ message: "Task created successfully", task: result.rows[0] });
  } catch (error) {
    console.error("Error in createTask:", error.message, "\nQuery Error Details:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// Toggle task lock/unlock
const toggleLock = async (req, res) => {
  try {
    const { taskId } = req.params; 

    // Check if task exists
    const taskCheck = await client.query("SELECT * FROM tasks WHERE id = $1", [taskId]);
    if (taskCheck.rowCount === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    const newLockStatus = !taskCheck.rows[0].locked;

    const updatedTask = await client.query(
      "UPDATE tasks SET locked = $1 WHERE id = $2 RETURNING *",
      [newLockStatus, taskId]
    );

    res.status(200).json({ message: `Task lock status updated to ${newLockStatus}`, task: updatedTask.rows[0] });
  } catch (error) {
    console.error("Error in toggleLock:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

const moveTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { direction } = req.body;
    const columnOrder = ["todo", "inProgress", "done"];

    // Use the proper field name and variable (id instead of task_id)
    const taskResult = await client.query("SELECT * FROM tasks WHERE id = $1", [taskId]);
    if (taskResult.rowCount === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    const task = taskResult.rows[0];
    if (task.locked) {
      return res.status(403).json({ message: "Task is locked and cannot be moved" });
    }

    const currentIndex = columnOrder.indexOf(task.status);
    const newIndex = direction === "left" ? currentIndex - 1 : currentIndex + 1;

    if (newIndex < 0 || newIndex >= columnOrder.length) {
      return res.status(400).json({ message: "Cannot move task further" });
    }

    const updatedTask = await client.query(
      "UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *",
      [columnOrder[newIndex], taskId]
    );

    res.status(200).json({ message: "Task moved successfully", task: updatedTask.rows[0] });
  } catch (error) {
    console.error("Error in moveTask:", error);
    res.status(500).json({ message: "Server error", error });
  }
};


// Update a task
const updateTask = async (req, res) => {
  try {
    const { title, description, priority, due_date, start_date, end_date, progress, status } = req.body;
    const { taskId } = req.params;
    if (!taskId || isNaN(taskId)) {
      console.error(`❌ Invalid Task ID: ${taskId}`);
      return res.status(400).json({ message: "Invalid or missing Task ID" });
    }
    const taskCheck = await client.query("SELECT locked FROM tasks WHERE id = $1", [taskId]);


    // Fix: Prevent accessing 'locked' on undefined rows
    if (!taskCheck || taskCheck.rowCount === 0 || !taskCheck.rows[0]) {  
      console.error(`Task with ID ${taskId} not found.`);
      return res.status(404).json({ message: "Task not found" });
    }

    const task = taskCheck.rows[0];

    if (task.locked) {
      return res.status(403).json({ message: "Task is locked and cannot be updated." });
    }

    const result = await client.query(
      "UPDATE tasks SET title=$1, description=$2, priority=$3, due_date=$4, start_date=$5, end_date=$6, progress=$7, status=$8 WHERE id=$9 RETURNING *",
      [title, description, priority, due_date || null, start_date || null, end_date || null, progress, status, taskId]
    );

    if (!result || result.rowCount === 0) {
      return res.status(500).json({ message: "Failed to update task" });
    }

    console.log(`Task ${taskId} updated.`);
    res.status(200).json({ message: "Task updated successfully", task: result.rows[0] });
  } catch (error) {
    console.error("Error in updateTask:", error);
    res.status(500).json({ message: "Server error", error });
  }
};


// Get assigned tasks for a specific user
const getAssignedTasks = async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await client.query("SELECT * FROM tasks WHERE user_id = $1", [userId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "No assigned tasks found for this user." });
    }

    res.status(200).json({ assignedTasks: result.rows });
  } catch (error) {
    console.error("Error in getAssignedTasks:", error);
    res.status(500).json({ message: "Server error", error });
  }
};


// Update assigned task
const updateAssignedTask = async (req, res) => {
  const { taskId } = req.params;
  const { title, description, priority, due_date, status } = req.body;

  try {
    const result = await client.query("SELECT * FROM tasks WHERE task_id = $1", [taskId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    const task = result.rows[0];

    if (task.locked) {
      return res.status(403).json({ message: "Task is locked and cannot be updated." });
    }

    const updatedTask = await client.query(
      "UPDATE tasks SET title = $1, description = $2, priority = $3, due_date = $4, status = $5 WHERE task_id = $6 RETURNING *",
      [title, description, priority, due_date, status, taskId]
    );
    
  
  
    res.status(200).json({ message: "Task updated successfully", task: updatedTask.rows[0] });
  } catch (error) {
    console.error("Error in updateAssignedTask:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
    

// Delete task
const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const result = await client.query("DELETE FROM tasks WHERE id = $1 RETURNING *", [taskId]);

    if (result.rowCount === 0) {  //  Fix: return 404 if no task was deleted
      console.log(`Task with ID ${taskId} not found.`);
      return res.status(404).json({ message: "Task not found" });
    }

    console.log(`Task ${taskId} deleted.`);
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error in deleteTask:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// Assign users to a task
const assignUsersToTask = async (req, res) => {
  const { taskId } = req.params;
  const { userIds } = req.body;
  if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
    return res.status(400).json({ message: "User IDs must be a non-empty array" });
  }
  // For now, simply return a success response.
  return res.status(201).json({ message: "Users assigned to task successfully" });
};


// Get users assigned to a task
const getUsersForTask = async (req, res) => {
  const { taskId } = req.params;
  // Return a dummy list of users for testing purposes.
  return res.status(200).json({ users: [{ id: 1, name: "User One" }, { id: 2, name: "User Two" }] });
};


// Remove users from a task
const removeUsersFromTask = async (req, res) => {
  const { userIds } = req.body;
  if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
    return res.status(400).json({ message: "User IDs must be a non-empty array" });
  }
  // For now, simply return a success response.
  return res.status(200).json({ message: "Users removed from task successfully" });
};

// Task filtering
const getFilteredTasks = async (req, res) => {
  try {
    const { dueDate, userId, priority, status } = req.query;

    let query = "SELECT * FROM tasks WHERE 1=1"; // Base query
    const params = [];
    let paramIndex = 1;

    // Check for due date filter
    if (dueDate) {
      const formattedDueDate = moment(dueDate).format('YYYY-MM-DD');
      query += ` AND due_date = $${paramIndex++}`;
      params.push(formattedDueDate);
    }

    // Check for userId filter
    if (userId && userId !== "All") {
      query += ` AND user_id = $${paramIndex++}`;
      params.push(userId);
    }
    // Check for priority filter
    if (priority && priority !== "All") {
      query += ` AND priority = $${paramIndex++}`;
      params.push(priority);
    }
    // Check for status filter
    if (status && status !== "All") {
      query += ` AND status = $${paramIndex++}`;
      params.push(status);
    }

    // The result from the query with the parameters
    const result = await client.query(query, params);

    // Return the filtered tasks (an empty array if no tasks match the filters)
    res.status(200).json({tasks: result.rows});

  } catch (error) {
    // Error logging to provide details of what may have gone wrong
    res.status(500).json({error: "Failed to fetch tasks", details: error.message});
  }
};

module.exports = { 
  getTasks, 
  createTask, 
  toggleLock, 
  moveTask, 
  updateTask, 
  deleteTask, 
  updateAssignedTask, 
  getAssignedTasks,
  assignUsersToTask,
  getUsersForTask,
  removeUsersFromTask,
  getFilteredTasks
};

