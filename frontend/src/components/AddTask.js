import React, { useState,useEffect } from "react";

const AddTask = ({ task, onSaveTask, onClose }) => {
  const formatDateForInput = (date) => {
    if (!date) return "";
    return new Date(date).toISOString().split("T")[0]; 
  };

  const [taskData, setTaskData] = useState(task || {
    title: "",
    description: "",
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
        dueDate: formatDateForInput(task.due_date),
        startDate: formatDateForInput(task.start_date),
        endDate: formatDateForInput(task.end_date),
      });
    }
  }, [task]);
  const handleChange = (e) => {
    setTaskData({ ...taskData, [e.target.name]: e.target.value });
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2>{task ? "Edit Task" : "Add New Task"}</h2>
        <input type="text" name="title" placeholder="Task Title" value={taskData.title} onChange={handleChange} style={styles.input} />
        <textarea name="description" placeholder="Task Description" value={taskData.description} onChange={handleChange} style={styles.input} />
        
        {/* ✅ Priority selection */}
        <label>Priority:</label>
        <select name="priority" value={taskData.priority} onChange={handleChange} style={styles.input}>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>

        {/* ✅ Status selection (Move between To-Do, In Progress, Done) */}
        <label>Move to:</label>
        <select name="status" value={taskData.status} onChange={handleChange} style={styles.input}>
          <option value="todo">To-Do</option>
          <option value="inProgress">In Progress</option>
          <option value="done">Done</option>
        </select>

 {/* ✅ Start Date */}
 <label>Start Date:</label>
        <input type="date" name="startDate" value={taskData.startDate} onChange={handleChange} style={styles.input} />
        
        {/* ✅ End Date */}
        <label>End Date:</label>
        <input type="date" name="endDate" value={taskData.endDate} onChange={handleChange} style={styles.input} />


        {/* ✅ Due Date */}
        <label>Due Date:</label>
        <input type="date" name="dueDate" value={taskData.dueDate} onChange={handleChange} style={styles.input} />

  
      {/* ✅ Progress Bar */}
      <label>Progress:</label>
        <input type="range" name="progress" min="0" max="100" value={taskData.progress} onChange={handleChange} style={styles.input} />
        <p>{taskData.progress}%</p>

        <button onClick={() => onSaveTask(taskData)} style={styles.saveButton}>{task ? "Update Task" : "Add Task"}</button>
        <button onClick={onClose} style={styles.closeButton}>Close</button>
      </div>
    </div>
  );
};

const styles = {
  overlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0, 0, 0, 0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 },
  modal: { background: "white", padding: "20px", borderRadius: "8px", width: "400px", boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)", display: "flex", flexDirection: "column", alignItems: "center" },
  input: { width: "100%", padding: "10px", marginBottom: "10px", border: "1px solid #ccc", borderRadius: "5px", fontSize: "16px" },
  saveButton: { width: "100%", padding: "10px", background: "#007bff", color: "white", border: "none", cursor: "pointer", borderRadius: "5px", fontSize: "16px" },
  closeButton: { width: "100%", padding: "10px", background: "#dc3545", color: "white", border: "none", cursor: "pointer", borderRadius: "5px", fontSize: "16px" }
};

export default AddTask;
