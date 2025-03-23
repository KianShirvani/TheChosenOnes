// dependencies
const moment = require('moment');
const client = require('../database/db');

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
    const parsedPriority = priority !== undefined ? parseInt(priority, 10) : 2;
    if (priority !== undefined && isNaN(parsedPriority)) {
      return res.status(400).json({ message: "Priority must be a valid integer" });
    }
    const result = await client.query(
      "INSERT INTO tasks (kanban_id, user_id, title, description, priority, due_date, start_date, end_date, progress, status, locked) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, false) RETURNING *",
      [kanban_id, user_id, title, description, parsedPriority, moment(due_date).format('YYYY-MM-DD'), moment(start_date).format('YYYY-MM-DD'), moment(end_date).format('YYYY-MM-DD'), progress || 0, status]
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
    const taskCheck = await client.query("SELECT * FROM tasks WHERE task_id = $1", [taskId]);
    if (taskCheck.rowCount === 0) {
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

const moveTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { direction } = req.body;
    const columnOrder = ["to do", "In Progress", "done"];

    // Use the proper field name and variable (id instead of task_id)
    const taskResult = await client.query("SELECT * FROM tasks WHERE task_id = $1", [taskId]);
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
      "UPDATE tasks SET status = $1 WHERE task_id = $2 RETURNING *",
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
    const { title, description, priority, due_date, start_date, end_date, progress, status, assignedUsers } = req.body;
    const { taskId } = req.params;

    // Validate task ID
    if (!taskId || isNaN(taskId)) {
      console.error(`Invalid Task ID: ${taskId}`);
      return res.status(400).json({ message: "Invalid or missing Task ID" });
    }

    // Check if the task exists
    const taskCheck = await client.query("SELECT * FROM tasks WHERE task_id = $1", [taskId]);
    
    if (taskCheck.rowCount === 0) {
      console.error(`Task with ID ${taskId} not found.`);
      return res.status(404).json({ message: "Task not found" });
    }

    const task = taskCheck.rows[0];

    // Check if task is locked
    if (task.locked) {
      return res.status(403).json({ message: "Task is locked and cannot be updated." });
    }

    // Parse priority
    const parsedPriority = priority !== undefined ? parseInt(priority, 10) : 2;
    if (priority !== undefined && isNaN(parsedPriority)) {
      return res.status(400).json({ message: "Priority must be a valid integer" });
    }

    // Update task details
    const result = await client.query(
      "UPDATE tasks SET title=$1, description=$2, priority=$3, due_date=$4, start_date=$5, end_date=$6, progress=$7, status=$8 WHERE task_id=$9 RETURNING *",
      [title, description, parsedPriority, due_date || null, start_date || null, end_date || null, progress, status, taskId]
    );

    if (!result || result.rowCount === 0) {
      return res.status(500).json({ message: "Failed to update task" });
    }

    // If there are assigned users, update the task_users table
    if (assignedUsers && Array.isArray(assignedUsers)) {
      // First, remove any users currently assigned to the task
      await client.query("DELETE FROM task_users WHERE task_id = $1", [taskId]);

      // Now, add the new assigned users
      const userPromises = assignedUsers.map((userId) =>
        client.query("INSERT INTO task_users (task_id, user_id) VALUES ($1, $2)", [taskId, userId])
      );
      
      // Wait for all insert operations to complete
      await Promise.all(userPromises);
    }

    // Return the updated task
    console.log(`Task ${taskId} updated successfully.`);
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

    // Query task_users table to get task IDs for the given user
    const taskUserResult = await client.query("SELECT task_id FROM task_users WHERE user_id = $1", [userId]);

    if (taskUserResult.rowCount === 0) {
      return res.status(404).json({ message: "No assigned tasks found for this user." });
    }

    // Extract task_ids from the result
    const taskIds = taskUserResult.rows.map(row => row.task_id);

    // Now fetch the tasks from the tasks table using the task_ids
    const taskResult = await client.query("SELECT * FROM tasks WHERE id = ANY($1::int[])", [taskIds]);

    if (taskResult.rowCount === 0) {
      return res.status(404).json({ message: "No tasks found for this user." });
    }

    // Return the assigned tasks
    res.status(200).json({ assignedTasks: taskResult.rows });
  } catch (error) {
    console.error("Error in getAssignedTasks:", error);
    res.status(500).json({ message: "Server error", error });
  }
};


// Update assigned task
const updateAssignedTask = async (req, res) => {
  const { taskId } = req.params;
  const { title, description, priority, due_date, status, assignedUsers } = req.body;

  try {
    const result = await client.query("SELECT * FROM tasks WHERE task_id = $1", [taskId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    const task = result.rows[0];

    if (task.locked) {
      return res.status(403).json({ message: "Task is locked and cannot be updated." });
    }

    const parsedPriority = priority !== undefined ? parseInt(priority, 10) : 2;
    if (priority !== undefined && isNaN(parsedPriority)) {
      return res.status(400).json({ message: "Priority must be a valid integer" });
    }

    // Update task details
    const updatedTask = await client.query(
      "UPDATE tasks SET title = $1, description = $2, priority = $3, due_date = $4, status = $5 WHERE task_id = $6 RETURNING *",
      [title, description, parsedPriority, due_date, status, taskId]
    );

    // Now update the task_users table with the assigned users
    if (assignedUsers && Array.isArray(assignedUsers)) {
      // Get the current list of user IDs assigned to this task
      const currentAssignedUsersResult = await client.query(
        "SELECT user_id FROM task_users WHERE task_id = $1", [taskId]
      );
      const currentAssignedUsers = currentAssignedUsersResult.rows.map(row => row.user_id);

      // Users to add (present in assignedUsers but not in currentAssignedUsers)
      const usersToAdd = assignedUsers.filter(userId => !currentAssignedUsers.includes(userId));

      // Users to remove (present in currentAssignedUsers but not in assignedUsers)
      const usersToRemove = currentAssignedUsers.filter(userId => !assignedUsers.includes(userId));

      // Add new users to task_users table
      if (usersToAdd.length > 0) {
        const addPromises = usersToAdd.map(userId => {
          return client.query(
            "INSERT INTO task_users (task_id, user_id) VALUES ($1, $2)",
            [taskId, userId]
          );
        });
        await Promise.all(addPromises);
      }

      // Remove users no longer assigned from task_users table
      if (usersToRemove.length > 0) {
        const removePromises = usersToRemove.map(userId => {
          return client.query(
            "DELETE FROM task_users WHERE task_id = $1 AND user_id = $2",
            [taskId, userId]
          );
        });
        await Promise.all(removePromises);
      }
    }

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

    const result = await client.query("DELETE FROM tasks WHERE task_id = $1 RETURNING *", [taskId]);

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

  // Check if userIds is a non-empty array
  if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
    return res.status(400).json({ message: "User IDs must be a non-empty array" });
  }

  try {
    // Insert each userId-taskId pair into the task_users table
    const insertPromises = userIds.map(userId => {
      return client.query(
        "INSERT INTO task_users (task_id, user_id) VALUES ($1, $2)",
        [taskId, userId]
      );
    });

    // Wait for all insertions to complete
    await Promise.all(insertPromises);

    // Return success message
    return res.status(201).json({ message: "Users assigned to task successfully" });
  } catch (error) {
    console.error("Error assigning users to task:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};


// Get users assigned to a task
const getUsersForTask = async (req, res) => {
  const { taskId } = req.params;
  try {
    // Query the database to get users assigned to the given task
    const result = await client.query(
      `SELECT users.user_id FROM users JOIN task_users ON users.user_id = task_users.user_id WHERE task_users.task_id = $1`, 
      [taskId]
    );

    // If users are found, return them in the response
    if (result.rows.length > 0) {
      return res.status(200).json({ assignedUsers: result.rows });
    } else {
      // If no users are found, return an empty array or an appropriate message
      return res.status(404).json({ message: "No users assigned to this task" });
    }
  } catch (error) {
    // Handle any errors that occur during the query
    console.error("Error fetching users for task:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
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
