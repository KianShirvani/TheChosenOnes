import React, { useState,  useEffect } from "react";

const EditTaskModal = ({ task, onSave, onClose }) => {
  const formatDate = (date) => {
    return date ? new Date(date).toISOString().split("T")[0] : ""; 
  };
  const [taskData, setTaskData] = useState({
      id: task.id || null, 
      kanban_id: task.kanban_id ?? null, 
       user_id: task.user_id ?? null,
      title: task.title || "",
      description: task.description || "",
      priority: task.priority || "Medium",
      dueDate: formatDate(task.due_date)|| "",
      startDate: formatDate(task.start_date) || "", 
      endDate: formatDate(task.end_date) || "", 
      progress: task.progress || 0, 
      status: task.status || "todo",
    }); 
    useEffect(() => {
       
       setTaskData((prevData) => ({
         ...prevData,  
         id: task.id || null,
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
    const finalData = {
      id: task.id,  //  ensure id is passed
      kanban_id: task.kanban_id ?? 1,
      user_id: task.user_id ?? 1,
      title: taskData.title,
      description: taskData.description,
      priority: taskData.priority,
      dueDate: taskData.dueDate ? taskData.dueDate : null,
      startDate: taskData.startDate ? taskData.startDate : null,
    endDate: taskData.endDate ? taskData.endDate : null,
      progress: parseInt(taskData.progress, 10) || 0,
      status: taskData.status,
    };
  
    onSave(finalData);
    onSave({ ...taskData, id: task.task_id });
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2>Edit Task</h2>
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
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
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
    width: "400px",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    fontSize: "16px",
  },
  saveButton: {
    width: "100%",
    padding: "10px",
    background: "#007bff",
    color: "white",
    border: "none",
    cursor: "pointer",
    borderRadius: "5px",
    fontSize: "16px",
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
    fontSize: "16px",
  },
};

export default EditTaskModal;
