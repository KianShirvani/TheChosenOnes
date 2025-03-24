import React, { useState,  useEffect } from "react";

const EditTaskModal = ({ task, onSave, onClose }) => {
  const formatDate = (date) => {
    return date ? new Date(date).toISOString().split("T")[0] : ""; 
  };
  const [taskData, setTaskData] = useState({
    id: task.task_id || task.id || null,
    kanbanId: task.kanban_id ?? null,
    userId: task.user_id ?? null,
    title: task.title || "",
    description: task.description || "",
    priority: task.priority || "Medium",
    dueDate: formatDate(task.due_date) || "",
    startDate: formatDate(task.start_date) || "",
    endDate: formatDate(task.end_date) || "",
    progress: task.progress || 0,
    status: task.status || "to do",
  });
  
    useEffect(() => {
       
       setTaskData((prevData) => ({
         ...prevData,  
         task_id: task.task_id || task.id || null,
         kanban_id: task.kanban_id ?? null,
         user_id: task.user_id ?? null,
         title: task.title || "",
         description: task.description || "",
         priority: task.priority || "Medium",
         dueDate: formatDate(task.due_date),
         startDate: formatDate(task.start_date),
         endDate: formatDate(task.end_date),
         progress: task.progress || 0,
         status: task.status || "todo",
       }));
       console.log("Updated taskData in EditTaskModal:", taskData);
     }, [task]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTaskData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSave = () => {
    const priorityMap = {
      "Low": 1,
      "Medium": 2,
      "High": 3,
      "Critical": 4,
      "Urgent": 5,
    };
    const finalData = {
      id: taskData.id,
      kanban_id: taskData.kanbanId ?? 1,
      user_id: taskData.userId ?? 1,
      title: taskData.title,
      description: taskData.description,
      priority: priorityMap[taskData.priority] || 2,
      due_date: taskData.dueDate || null,
      start_date: taskData.startDate || null,
      end_date: taskData.endDate || null,
      progress: parseInt(taskData.progress, 10) || 0,
      status: taskData.status,
    };
    

    onSave(finalData);
  };

  return (
      <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2>Edit Task</h2>
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
          <option value="to do">To-Do</option>
          <option value="in progress">In Progress</option>
          <option value="done">Done</option>
        </select>

       {/* Progress Bar */}
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


        {/* Start Date */}
        <label>Start Date:</label>
        <input
          type="date"
          name="startDate"
          value={taskData.startDate}
          onChange={handleChange}
          style={styles.input}
        />

        {/* End Date */}
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
        <button onClick={handleSave} style={styles.saveButton}>
          Update Task
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
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    boxSizing: "border-box",
  },
  content: {
    width: "100%",
    maxHeight: "350px",
    overflowY: "auto",
    overflowX: "hidden",
    boxSizing: "border-box",
  },
  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    fontSize: "14px",
    boxSizing: "border-box",
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
    marginBottom: "10px",
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



export default EditTaskModal;
