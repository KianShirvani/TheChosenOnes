import React, { useState, useEffect } from "react";

const AddTask = ({ task, onSaveTask, onClose, availableUsers }) => {
  const formatDateForInput = (date) => {
    if (!date) return "";
    return new Date(date).toISOString().split("T")[0];
  };

  const [taskData, setTaskData] = useState(task || {
    title: "",
    description: "",
    assignedUsers: [],
    priority: "Medium",
    dueDate: "",
    startDate: "",
    endDate: "",
    progress: 0,
    status: "todo",
    kanbanId: null,
    userId: null,
  });

  useEffect(() => {
    if (task) {
      setTaskData({
        ...task,
        assignedUsers: task.assignedUsers || [],
        dueDate: formatDateForInput(task.due_date),
        startDate: formatDateForInput(task.start_date),
        endDate: formatDateForInput(task.end_date),
      });
    }
  }, [task]);

  const handleChange = (e) => {
    setTaskData({ ...taskData, [e.target.name]: e.target.value });
  };

  const handleAssignedUsersChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
    setTaskData({ ...taskData, assignedUsers: selectedOptions });
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2>{task ? "Edit Task" : "Add New Task"}</h2>
        <div style={styles.content}>
          <input type="text" name="title" placeholder="Task Title" value={taskData.title} onChange={handleChange} style={styles.input} />
          <textarea name="description" placeholder="Task Description" value={taskData.description} onChange={handleChange} style={styles.input} />

          <label>Assign Users:</label>
          <select 
            multiple
            name="assignedUsers"
            value={taskData.assignedUsers}
            onChange={handleAssignedUsersChange}
            style={styles.input}
          >
            {availableUsers && availableUsers.map(user => (
              <option key={user.user_id} value={user.user_id}>
                {user.display_name || `${user.first_name} ${user.last_name}`}
              </option>
            ))}
          </select>

          <label>Priority:</label>
          <select name="priority" value={taskData.priority} onChange={handleChange} style={styles.input}>
            <option value="Low">Low</option>
        <option value="Medium">Medium</option>
        <option value="High">High</option>
        <option value="Critical">Critical</option>
        <option value="Urgent">Urgent</option>
          </select>

          <label>Move to:</label>
          <select name="status" value={taskData.status} onChange={handleChange} style={styles.input}>
            <option value="todo">To-Do</option>
            <option value="inProgress">In Progress</option>
            <option value="done">Done</option>
          </select>

          <label>Start Date:</label>
          <input type="date" name="startDate" value={taskData.startDate} onChange={handleChange} style={styles.input} />
          
          <label>End Date:</label>
          <input type="date" name="endDate" value={taskData.endDate} onChange={handleChange} style={styles.input} />

          <label>Due Date:</label>
          <input type="date" name="dueDate" value={taskData.dueDate} onChange={handleChange} style={styles.input} />

          <label>Progress:</label>
          <input type="range" name="progress" min="0" max="100" value={taskData.progress} onChange={handleChange} style={styles.input} />
          <p>{taskData.progress}%</p>
        </div>

        <div style={styles.buttonContainer}>
          <button onClick={() => onSaveTask(taskData)} style={styles.saveButton}>{task ? "Update Task" : "Add Task"}</button>
          <button onClick={onClose} style={styles.closeButton}>Close</button>
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
    zIndex: 1000 
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
    overflowX: "hidden" 
  },
  content: { 
    width: "100%", 
    maxHeight: "350px", 
    overflowY: "auto", 
    boxSizing: "border-box",
    overflowX: "hidden"
  },
  input: { 
    width: "100%", 
    padding: "8px", 
    marginBottom: "10px", 
    border: "1px solid #ccc", 
    borderRadius: "5px", 
    fontSize: "14px",
    boxSizing: "border-box"
  },
  buttonContainer: { 
    display: "flex", 
    flexDirection: "column", 
    width: "100%" 
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
    marginBottom: "5px"
  },
  closeButton: { 
    width: "100%", 
    padding: "10px", 
    background: "#dc3545", 
    color: "white", 
    border: "none", 
    cursor: "pointer", 
    borderRadius: "5px", 
    fontSize: "14px"
  }
};

export default AddTask;
