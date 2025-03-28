import React, { useState, useEffect } from "react";

const AddTask = ({ task, onSaveTask, onClose, availableUsers }) => {
  const formatDateForInput = (date) => (date ? new Date(date).toISOString().split("T")[0] : "");

  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    assignedUsers: [],
    priority: "Medium",
    dueDate: "",
    startDate: "",
    endDate: "",
    progress: 0,
    status: "todo",
    kanbanId: 1, // Set default kanbanId to 1 because we are assuming only 1 kanban board exists
    userId: null,
  });

  useEffect(() => {
    if (task) {
      // Set initial task data
      setTaskData({
        ...task,
        assignedUsers: Array.isArray(task.assignedUsers) ? task.assignedUsers.map(user => user.user_id) : [], // Map to just user_ids
        dueDate: formatDateForInput(task.due_date),
        startDate: formatDateForInput(task.start_date),
        endDate: formatDateForInput(task.end_date),
      });
      
      // Fetch the assigned users from the backend
      fetchAssignedUsers(task.task_id);
    }
  }, [task]);

  const fetchAssignedUsers = async (taskId) => {
    try {
      console.log("Fetching assigned users for task:", taskId);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/tasks/${taskId}/users`);
      console.log("Response:", response);
      const data = await response.json();
      console.log("Assigned users:", data.assignedUsers);
      // Set the assigned users in the taskData state
      setTaskData((prevData) => ({
        ...prevData,
        assignedUsers: data.assignedUsers.map(user => user.user_id), // Assuming response gives user_id array
      }));
    } catch (error) {
      console.error("Error fetching assigned users:", error);
    }
  };

  const handleChange = (e) => {
    setTaskData({ ...taskData, [e.target.name]: e.target.value });
  };

  // **Handle user assignment using checkboxes**
  const handleUserCheck = (userId) => {
    setTaskData((prevData) => {
      const isAlreadyAssigned = prevData.assignedUsers.includes(userId);
      return {
        ...prevData,
        assignedUsers: isAlreadyAssigned
          ? prevData.assignedUsers.filter((id) => id !== userId) // Remove user if already assigned
          : [...prevData.assignedUsers, userId], // Add user if not assigned
      };
    });
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2>{task ? "Edit Task" : "Add New Task"}</h2>
        <div style={styles.content}>
          <input
            type="text"
            name="title"
            placeholder="Task Title"
            value={taskData.title}
            onChange={handleChange}
            style={styles.input}
          />
          <textarea
            name="description"
            placeholder="Task Description"
            value={taskData.description}
            onChange={handleChange}
            style={styles.input}
          />

          {/* GitHub-style checklist for assigned users */}
          <label>Assign Users:</label>
          <div style={styles.checkboxContainer}>
            {availableUsers.map((user) => (
              <label key={user.user_id} style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={taskData.assignedUsers.includes(user.user_id)}
                  onChange={() => handleUserCheck(user.user_id)}
                />
                {user.display_name || `${user.first_name} ${user.last_name}`}
              </label>
            ))}
          </div>

          <label>Priority:</label>
          <select
            name="priority"
            value={taskData.priority}
            onChange={handleChange}
            style={styles.input}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
            <option value="Urgent">Urgent</option>
          </select>

          <label>Move to:</label>
          <select
            name="status"
            value={taskData.status}
            onChange={handleChange}
            style={styles.input}
          >
            <option value="todo">To-Do</option>
            <option value="inProgress">In Progress</option>
            <option value="done">Done</option>
          </select>

          <label>Start Date:</label>
          <input
            type="date"
            name="startDate"
            value={taskData.startDate}
            onChange={handleChange}
            style={styles.input}
          />

          <label>End Date:</label>
          <input
            type="date"
            name="endDate"
            value={taskData.endDate}
            onChange={handleChange}
            style={styles.input}
          />

          <label>Due Date:</label>
          <input
            type="date"
            name="dueDate"
            value={taskData.dueDate}
            onChange={handleChange}
            style={styles.input}
          />

          <label>Progress:</label>
          <input
            type="range"
            name="progress"
            min="0"
            max="100"
            value={taskData.progress}
            onChange={handleChange}
            style={styles.input}
          />
          <p>{taskData.progress}%</p>
        </div>

        <div style={styles.buttonContainer}>
          <button onClick={() => onSaveTask(taskData)} style={styles.saveButton}>
            {task ? "Update Task" : "Add Task"}
          </button>
          <button onClick={onClose} style={styles.closeButton}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    background: "white",
    padding: "20px",
    borderRadius: "8px",
    width: "450px",
    maxHeight: "500px",
    overflow: "hidden",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    boxSizing: "border-box",
    overflowX: "hidden",
  },
  content: {
    width: "100%",
    maxHeight: "350px",
    overflowY: "auto",
    boxSizing: "border-box",
    overflowX: "hidden",
  },
  input: {
    width: "100%",
    padding: "8px",
    marginBottom: "10px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    fontSize: "14px",
    boxSizing: "border-box",
  },
  checkboxContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    marginBottom: "10px",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },
  buttonContainer: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
  },
  saveButton: {
    width: "100%",
    padding: "10px",
    background: "#007bff",
    color: "white",
    border: "none",
    cursor: "pointer",
    borderRadius: "5px",
    fontSize: "14px",
    marginBottom: "5px",
  },
  closeButton: {
    width: "100%",
    padding: "10px",
    background: "#dc3545",
    color: "white",
    border: "none",
    cursor: "pointer",
    borderRadius: "5px",
    fontSize: "14px",
  },
};

export default AddTask;
